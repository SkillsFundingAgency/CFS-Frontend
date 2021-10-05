import { AxiosError } from "axios";
import { equals } from "ramda";
import React, { MouseEvent, useMemo, useState } from "react";
import { useQuery } from "react-query";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";

import { AutoComplete } from "../../components/AutoComplete";
import { BackLink } from "../../components/BackLink";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { LoadingFieldStatus } from "../../components/LoadingFieldStatus";
import { Main } from "../../components/Main";
import { MultipleErrorSummary } from "../../components/MultipleErrorSummary";
import { NotificationBanner } from "../../components/NotificationBanner";
import { Title } from "../../components/Title";
import { WarningText } from "../../components/WarningText";
import { getPermissionDescription } from "../../helpers/permissionsHelper";
import { convertToSlug } from "../../helpers/stringHelper";
import { milliseconds } from "../../helpers/TimeInMs";
import { applyPermission, getEnabledPermissions } from "../../hooks/Permissions/useFundingStreamPermissions";
import { useConfirmLeavePage } from "../../hooks/useConfirmLeavePage";
import { useErrors } from "../../hooks/useErrors";
import { IStoreState } from "../../reducers/rootReducer";
import * as userService from "../../services/userService";
import { buildPermissions } from "../../tests/fakes/testFactories";
import { FundingStreamPermissions } from "../../types/FundingStreamPermissions";
import { Permission } from "../../types/Permission";
import { Section } from "../../types/Sections";
import { UserSearchResult, UserSearchResultItem } from "../../types/Users/UserSearchResult";
import { FundingStream } from "../../types/viewFundingTypes";

export function IndividualPermissionsAdmin(): JSX.Element {
  const pageTitle = (document.title = "Set and view user permissions");
  const myPermissions: FundingStreamPermissions[] = useSelector(
    (state: IStoreState) => state.userState.fundingStreamPermissions
  );
  const fundingStreamsForAdmin: FundingStream[] = useMemo(
    () =>
      myPermissions &&
      myPermissions
        .filter((fs) => fs.canAdministerFundingStream)
        .map(
          (fs) =>
            ({
              id: fs.fundingStreamId,
              name: fs.fundingStreamName,
            } as FundingStream)
        ),
    [myPermissions]
  );
  const { errors, addError, clearErrorMessages } = useErrors();
  const { data: usersSearchResult } = useQuery<UserSearchResult, AxiosError>(
    "users",
    async () => (await userService.findUsers("")).data,
    {
      refetchOnWindowFocus: false,
      enabled: fundingStreamsForAdmin?.length > 0,
      cacheTime: milliseconds.ThreeMinutes,
      staleTime: milliseconds.ThreeMinutes,
      onError: (err) =>
        addError({
          error: err,
          description: "Could not load user search",
          suggestion: "Please try again later",
        }),
    }
  );
  const permissionsToShow: Permission[] = useMemo(() => {
    const allPerms: Permission[] = Object.values(Permission).map((x) => x.toString()) as Permission[];
    return allPerms.sort((a, b) => a.localeCompare(b));
  }, []);
  const users: string[] = useMemo(
    () =>
      !usersSearchResult?.users
        ? []
        : usersSearchResult.users.sort((a, b) => a.name.localeCompare(b.name)).map((u) => u.name),
    [usersSearchResult]
  );
  const [isLoadingUserPermissions, setIsLoadingUserPermissions] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [notification, setNotification] = useState<any | undefined>();
  const [user, setUser] = useState<UserSearchResultItem>();
  const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream>();
  const [selectedUserFundingStreamPermissions, setSelectedUserFundingStreamPermissions] =
    useState<FundingStreamPermissions>();
  const [originalPermissions, setOriginalPermissions] = useState<Permission[]>();
  const [editedPermissions, setEditedPermissions] = useState<Permission[]>();
  const history = useHistory();
  useConfirmLeavePage(!equals(originalPermissions, editedPermissions));

  const onUserSelected = (name: string) => {
    clearErrorMessages();
    setNotification(undefined);
    setUser(undefined);
    setEditedPermissions(undefined);
    setOriginalPermissions(undefined);
    if (!usersSearchResult?.users) return;

    const match = usersSearchResult.users.find((x) => x.name === name);
    setUser(match);
  };

  const onFundingStreamSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearErrorMessages();
    setNotification(undefined);
    setEditedPermissions(undefined);
    setOriginalPermissions(undefined);
    setSelectedFundingStream(fundingStreamsForAdmin.find((fs) => fs.id === e.target.value));
  };

  const onSubmitCriteria = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrorMessages();
    setNotification(undefined);

    if (!user) {
      addError({ error: "Select a user", fieldName: "user-select" });
      setEditedPermissions(undefined);
      setOriginalPermissions(undefined);
      return;
    }
    if (!selectedFundingStream) {
      addError({ error: "Select a funding stream", fieldName: "fundingStream" });
      setEditedPermissions(undefined);
      setOriginalPermissions(undefined);
      return;
    }

    try {
      setIsLoadingUserPermissions(true);
      const response = await userService.getOtherUsersPermissionsForFundingStream(
        user.id,
        selectedFundingStream.id
      );
      const permissions = response.data;
      setSelectedUserFundingStreamPermissions(permissions);
      const enabledPermissions: Permission[] = getEnabledPermissions(permissions);
      setEditedPermissions(enabledPermissions);
      setOriginalPermissions(enabledPermissions);
    } catch (e: any) {
      addError({ error: e, description: "Error while fetching user's permissions" });
      setEditedPermissions(undefined);
      setOriginalPermissions(undefined);
    } finally {
      setIsLoadingUserPermissions(false);
    }
  };

  const onChangePermission = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearErrorMessages();
    setNotification(undefined);
    if (!editedPermissions || !selectedUserFundingStreamPermissions) return;

    const permissionName = e.target.value;
    const permission: Permission | undefined = permissionsToShow.find((p) => p.toString() == permissionName);
    if (!permission) return;

    const enabledBefore = editedPermissions.includes(permission);
    if (enabledBefore) {
      setEditedPermissions(editedPermissions.filter((p) => p !== permission));
    } else {
      setEditedPermissions([...editedPermissions, permission]);
    }
    const updated = applyPermission(selectedUserFundingStreamPermissions, permission, !enabledBefore);
    setSelectedUserFundingStreamPermissions(updated);
  };

  const onRemoveUserPermissions = async () => {
    clearErrorMessages();
    setNotification(undefined);
    if (isSaving || isRemoving || !user || !selectedFundingStream) return;

    ConfirmationModal(
      <div className="govuk-row govuk-!-width-full">
        Are you sure you want to remove all user permissions for {user.name}
        and delete them from the {selectedFundingStream.name} funding stream?
      </div>,
      removeUserPermissions,
      "Yes, remove user permissions",
      "No, stay on this page"
    );
  };

  const removeUserPermissions = async () => {
    if (isSaving || isRemoving || !user || !selectedFundingStream) return;

    setIsRemoving(true);

    try {
      await userService.removeOtherUserFromFundingStream(user.id, selectedFundingStream.id);
      setOriginalPermissions([]);
      setEditedPermissions([]);
      setSelectedUserFundingStreamPermissions(
        buildPermissions({
          fundingStreamId: selectedFundingStream.id,
          fundingStreamName: selectedFundingStream.name,
          setAllPermsEnabled: false,
        })
      );
      setNotification(
        <>
          Removed <span id="user">{user.name}</span> from {selectedFundingStream.name} funding stream
        </>
      );
      resetForm();
    } catch (e: any) {
      addError({ error: e, description: "Error removing user's permissions, try again" });
    } finally {
      setIsRemoving(false);
    }
    window.scrollTo(0, 0);
  };

  const onCancelEdit = (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    !!event && event.preventDefault();
    clearErrorMessages();
    setNotification(undefined);

    if (!equals(originalPermissions, editedPermissions)) {
      ConfirmationModal(
        <div className="govuk-row govuk-!-width-full">
          Are you sure you want to leave without saving your changes?
        </div>,
        resetForm,
        "Leave this page",
        "Stay on this page"
      );
    } else {
      resetForm();
    }
  };

  const resetForm = () => {
    setUser(undefined);
    setSelectedFundingStream(undefined);
    setEditedPermissions(undefined);
    setSelectedUserFundingStreamPermissions(undefined);
  };

  const onSaveUserPermissions = async () => {
    clearErrorMessages();

    if (
      isSaving ||
      isRemoving ||
      !user ||
      !selectedFundingStream ||
      !editedPermissions ||
      !selectedUserFundingStreamPermissions
    )
      return;

    setIsSaving(true);

    try {
      const response = await userService.updateOtherUsersPermissionsForFundingStream(
        selectedUserFundingStreamPermissions
      );

      const permissions = response.data;
      setSelectedUserFundingStreamPermissions(permissions);
      const enabledPermissions: Permission[] = getEnabledPermissions(permissions);
      setEditedPermissions(enabledPermissions);
      setOriginalPermissions(enabledPermissions);
      setNotification(
        <>
          Permissions updated for <span id="user">{user.name}</span> for {selectedFundingStream.name} funding
          stream
        </>
      );
    } catch (e: any) {
      addError({ error: e, description: "Error saving changes, try again" });
    } finally {
      setIsSaving(false);
    }
    window.scrollTo(0, 0);
  };

  const FundingStreamSelection = (props: {
    selectedFundingStream: FundingStream | undefined;
    fundingStreams: FundingStream[] | undefined;
    callback: any;
  }) => {
    if (!props.fundingStreams) return null;

    return (
      <div className="govuk-form-group">
        <label className="govuk-label" htmlFor="fundingStream">
          Select funding stream
        </label>
        <select
          id="fundingStream"
          onChange={props.callback}
          defaultValue={props.selectedFundingStream?.id}
          name="fundingStream"
          className="govuk-select"
        >
          <option></option>
          {props.fundingStreams
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((fs) => (
              <option value={fs.id} defaultChecked={props.selectedFundingStream?.id === fs.id} key={fs.id}>
                {fs.name}
              </option>
            ))}
        </select>
      </div>
    );
  };

  const UserPermissionDisplay = (props: {
    permission: Permission;
    enabledPermissions: Permission[] | undefined;
  }) => {
    const permissionTitle = props.permission.toString();
    const slug = convertToSlug(permissionTitle);
    const permissionDescription = getPermissionDescription(props.permission);
    return (
      <div className="govuk-checkboxes govuk-checkboxes--small">
        <div className="govuk-checkboxes__item">
          <input
            className="govuk-checkboxes__input"
            id={slug}
            name={slug}
            type="checkbox"
            defaultChecked={props.enabledPermissions?.includes(props.permission)}
            onChange={onChangePermission}
            value={permissionTitle}
            title={permissionTitle}
            aria-describedby={`permissions-hint-${slug}`}
          />
          <label className="govuk-label govuk-checkboxes__label" htmlFor={`permissions-hint-${slug}`}>
            {permissionTitle}
          </label>
          <div id={`permissions-hint-${slug}`} className="govuk-hint govuk-checkboxes__hint">
            {permissionDescription}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Main location={Section.Home}>
      <MultipleErrorSummary errors={errors} />

      {!selectedUserFundingStreamPermissions && (
        <Title
          title={pageTitle}
          description="Assign and view permissions for users of Calculate funding service"
          includeBackLink={true}
        />
      )}
      {!!selectedUserFundingStreamPermissions && (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full">
            <BackLink handleOnClick={onCancelEdit} />
          </div>
        </div>
      )}

      {notification && <NotificationBanner title="Success">{notification}</NotificationBanner>}

      {fundingStreamsForAdmin?.length === 0 && (
        <WarningText text="You don't have any admin permissions" className="govuk-!-margin-top-4" />
      )}
      {!selectedUserFundingStreamPermissions && fundingStreamsForAdmin.length > 0 && (
        <section id="select-user-and-funding-stream" className="govuk-grid-row govuk-!-margin-top-2">
          <div className="govuk-grid-column-full">
            <form id="criteria-form" onSubmit={onSubmitCriteria}>
              <fieldset className="govuk-fieldset">
                <div className="govuk-form-group">
                  <label className="govuk-label" id="user-permissions" htmlFor="user-select">
                    Find the user for whom you wish to view, assign, or change permissions
                  </label>
                  <div id="user-select" className="autocomplete-wrapper">
                    {users ? (
                      <AutoComplete suggestions={users} callback={onUserSelected} />
                    ) : (
                      <LoadingFieldStatus title="Loading..." />
                    )}
                  </div>
                </div>
                {user && (
                  <FundingStreamSelection
                    selectedFundingStream={selectedFundingStream}
                    fundingStreams={fundingStreamsForAdmin}
                    callback={onFundingStreamSelect}
                  />
                )}
                <button type="submit" className="govuk-button govuk-!-margin-right-1">
                  {isLoadingUserPermissions ? (
                    <>
                      <span className="loader loader-small" role="alert" aria-live="assertive" /> Loading...
                    </>
                  ) : (
                    "Continue"
                  )}
                </button>
                <a
                  className="govuk-button govuk-button--secondary"
                  data-module="govuk-button"
                  onClick={history.goBack}
                >
                  Cancel
                </a>
              </fieldset>
            </form>
          </div>
        </section>
      )}
      {selectedUserFundingStreamPermissions && (
        <section>
          <div className="govuk-grid-row govuk-!-margin-top-5">
            <div className="govuk-grid-column-full">
              <div className="govuk-form-group">
                <fieldset className="govuk-fieldset" aria-describedby="funding-stream-permissions-hint">
                  <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                    <h1 className="govuk-fieldset__heading">Set and view user permissions</h1>
                  </legend>
                  <div id="funding-stream-permissions-hint" className="govuk-hint govuk-!-margin-bottom-7">
                    Assign and view permissions for {user?.name} for {selectedFundingStream?.name} funding
                    stream.
                  </div>
                  {permissionsToShow.map((p, index) => (
                    <UserPermissionDisplay
                      key={index}
                      permission={p}
                      enabledPermissions={editedPermissions}
                    />
                  ))}
                </fieldset>
              </div>
            </div>
          </div>
          <div className="govuk-grid-row">
            <div className="govuk-grid-columns-two-thirds">
              <button
                onClick={onSaveUserPermissions}
                disabled={isSaving || isRemoving}
                className="govuk-button govuk-!-margin-right-1"
                data-module="govuk-button"
              >
                {isSaving ? (
                  <>
                    <span className="loader loader-small" role="alert" aria-live="assertive" /> Saving...
                  </>
                ) : (
                  "Apply permissions"
                )}
              </button>
              <button
                onClick={(e) => onCancelEdit(e as React.MouseEvent<HTMLButtonElement>)}
                className="govuk-button govuk-button--secondary govuk-!-margin-right-1"
              >
                Back
              </button>
              <button
                onClick={onRemoveUserPermissions}
                disabled={isSaving || isRemoving}
                className="govuk-button govuk-button--warning govuk-!-margin-right-1"
              >
                {isRemoving ? (
                  <>
                    <span className="loader loader-small" role="alert" aria-live="assertive" /> Removing...
                  </>
                ) : (
                  "Remove user permissions"
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </Main>
  );
}
