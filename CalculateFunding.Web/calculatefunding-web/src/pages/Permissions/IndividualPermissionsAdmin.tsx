import {Section} from "../../types/Sections";
import {MultipleErrorSummary} from "../../components/MultipleErrorSummary";
import {WarningText} from "../../components/WarningText";
import {Main} from "../../components/Main";
import React, {MouseEvent, useMemo, useState} from "react";
import {FundingStreamPermissions} from "../../types/FundingStreamPermissions";
import {useSelector} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {useErrors} from "../../hooks/useErrors";
import {Title} from "../../components/Title";
import * as userService from "../../services/userService";
import {AutoComplete} from "../../components/AutoComplete";
import {UserSearchResult, UserSearchResultItem} from "../../types/Users/UserSearchResult";
import {useQuery} from "react-query";
import {AxiosError} from "axios";
import {LoadingFieldStatus} from "../../components/LoadingFieldStatus";
import {FundingStream} from "../../types/viewFundingTypes";
import {useHistory} from "react-router";
import {applyPermission, getEnabledPermissions} from "../../hooks/Permissions/useFundingStreamPermissions";
import {Permission} from "../../types/Permission";
import {getPermissionDescription} from "../../helpers/permissionsHelper";
import {BackLink} from "../../components/BackLink";
import {convertToSlug} from "../../helpers/stringHelper";
import {milliseconds} from "../../helpers/TimeInMs";

export function IndividualPermissionsAdmin() {
    const pageTitle = document.title = "Set and view user permissions";
    const myPermissions: FundingStreamPermissions[] = useSelector((state: IStoreState) => state.userState.fundingStreamPermissions);
    const fundingStreamsForAdmin: FundingStream[] = useMemo(() => myPermissions && myPermissions
        .filter(fs => fs.canAdministerFundingStream)
        .map(fs => ({
            id: fs.fundingStreamId,
            name: fs.fundingStreamName
        }) as FundingStream), [myPermissions]);
    const {errors, addError, clearErrorMessages} = useErrors();
    const {data: usersSearchResult} =
        useQuery<UserSearchResult, AxiosError>(`users`,
            async () => (await userService.findUsers("")).data,
            {
                refetchOnWindowFocus: false,
                enabled: fundingStreamsForAdmin?.length > 0,
                cacheTime: milliseconds.ThreeMinutes,
                staleTime: milliseconds.ThreeMinutes,
                onError: err => addError({
                    error: err,
                    description: "Could not load user search",
                    suggestion: "Please try again later"
                })
            });
    const permissionsToShow: Permission[] = useMemo(() => {
        const allPerms: Permission[] = Object.values(Permission).map(x => x.toString()) as Permission[];
        return allPerms.sort((a, b) => a.localeCompare(b))
    }, []);
    const users: string[] = useMemo(() => !usersSearchResult?.users ?
        [] :
        usersSearchResult.users
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(u => u.name),
        [usersSearchResult]);
    const [isLoadingUserPermissions, setIsLoadingUserPermissions] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isRemoving, setIsRemoving] = useState<boolean>(false);
    const [user, setUser] = useState<UserSearchResultItem>();
    const [selectedFundingStream, setSelectedFundingStream] = useState<FundingStream>();
    const [selectedUserFundingStreamPermissions, setSelectedUserFundingStreamPermissions] = useState<FundingStreamPermissions>();
    const [selectedUsersEnabledPermissions, setSelectedUsersEnabledPermissions] = useState<Permission[]>();
    const history = useHistory();


    const onUserSelected = (name: string) => {
        clearErrorMessages();
        setUser(undefined);
        setSelectedUsersEnabledPermissions(undefined);
        if (!usersSearchResult?.users) return;

        const match = usersSearchResult.users.find(x => x.name === name);
        setUser(match);
    }

    const onFundingStreamSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        clearErrorMessages();
        setSelectedUsersEnabledPermissions(undefined);
        setSelectedFundingStream(fundingStreamsForAdmin.find(fs => fs.id === e.target.value));
    }

    const onSubmitCriteria = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        clearErrorMessages();

        if (!user) {
            addError({error: "Select a user", fieldName: "user-select"})
            setSelectedUsersEnabledPermissions(undefined);
            return;
        }
        if (!selectedFundingStream) {
            addError({error: "Select a funding stream", fieldName: "fundingStream"})
            setSelectedUsersEnabledPermissions(undefined);
            return;
        }

        try {
            setIsLoadingUserPermissions(true);
            const response = await userService.getOtherUsersPermissionsForFundingStream(user.id, selectedFundingStream.id);
            const permissions = response.data;
            setSelectedUserFundingStreamPermissions(permissions);
            const enabledPermissions: Permission[] = getEnabledPermissions(permissions);
            setSelectedUsersEnabledPermissions(enabledPermissions);
        } catch (e) {
            addError({error: e, description: "Error while fetching user's permissions"})
            setSelectedUsersEnabledPermissions(undefined);
        } finally {
            setIsLoadingUserPermissions(false);
        }
    }

    const onChangePermission = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearErrorMessages();
        if (!selectedUsersEnabledPermissions || !selectedUserFundingStreamPermissions) return;

        const permissionName = e.target.value;
        const permission: Permission | undefined = permissionsToShow.find(p => p.toString() == permissionName);
        if (!permission) return;

        const enabledBefore = selectedUsersEnabledPermissions.includes(permission);
        if (enabledBefore) {
            setSelectedUsersEnabledPermissions(selectedUsersEnabledPermissions.filter(p => p !== permission));
        } else {
            setSelectedUsersEnabledPermissions([...selectedUsersEnabledPermissions, permission]);
        }
        const updated = applyPermission(selectedUserFundingStreamPermissions, permission, !enabledBefore);
        setSelectedUserFundingStreamPermissions(updated);
    }

    const onRemoveUserPermissions = async () => {
        clearErrorMessages();
        if (isSaving || isRemoving || !user || !selectedFundingStream) return;

        setIsRemoving(true);

        try {
            await userService.removeOtherUserFromFundingStream(user.id, selectedFundingStream.id);
        } catch (e) {
            addError({error: e, description: "Error removing user's permissions, try again"})
        } finally {
            setIsRemoving(false);
        }
    }

    const onCancelEdit = async (event: MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        !!event && event.preventDefault();
        clearErrorMessages();
        setUser(undefined);
        setSelectedFundingStream(undefined);
        setSelectedUsersEnabledPermissions(undefined)
        setSelectedUserFundingStreamPermissions(undefined)
    }

    const onSaveUserPermissions = async () => {
        clearErrorMessages();

        if (isSaving || isRemoving || !user || !selectedFundingStream || !selectedUsersEnabledPermissions || !selectedUserFundingStreamPermissions) return;

        setIsSaving(true);

        try {
            const response = await userService.updateOtherUsersPermissionsForFundingStream(selectedUserFundingStreamPermissions);

            setSelectedUserFundingStreamPermissions(response.data);
            setSelectedUsersEnabledPermissions(getEnabledPermissions(response.data));
        } catch (e) {
            addError({error: e, description: "Error saving changes, try again"})
        } finally {
            setIsSaving(false);
        }
    };

    const FundingStreamSelection = (props: {
        selectedFundingStream: FundingStream | undefined,
        fundingStreams: FundingStream[] | undefined,
        callback: any
    }) => {

        if (!props.fundingStreams)
            return null;

        return (
            <div className="govuk-form-group">
                <label className="govuk-label" htmlFor="fundingStream">
                    Select funding stream
                </label>
                <select id="fundingStream"
                        onChange={props.callback}
                        defaultValue={props.selectedFundingStream?.id}
                        name="fundingStream"
                        className="govuk-select">
                    <option></option>
                    {props.fundingStreams
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(fs =>
                            <option
                                value={fs.id}
                                defaultChecked={props.selectedFundingStream?.id === fs.id}
                                key={fs.id}>{fs.name}</option>
                        )}
                </select>
            </div>
        )
    };

    const UserPermissionDisplay = (props: { permission: Permission, enabledPermissions: Permission[] | undefined }) => {
        const permissionTitle = props.permission.toString();
        const slug = convertToSlug(permissionTitle);
        const permissionDescription = getPermissionDescription(props.permission);
        return (
            <div className="govuk-checkboxes govuk-checkboxes--small">
                <div className="govuk-checkboxes__item">
                    <input className="govuk-checkboxes__input"
                           id={slug}
                           name={slug}
                           type="checkbox"
                           defaultChecked={props.enabledPermissions?.includes(props.permission)}
                           onChange={onChangePermission}
                           value={permissionTitle}
                           title={permissionTitle}
                           aria-describedby={`permissions-hint-${slug}`}/>
                    <label className="govuk-label govuk-checkboxes__label"
                           htmlFor={`permissions-hint-${slug}`}>
                        {permissionTitle}
                    </label>
                    <div id={`permissions-hint-${slug}`}
                         className="govuk-hint govuk-checkboxes__hint">
                        {permissionDescription}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Main location={Section.Home}>
            <MultipleErrorSummary errors={errors}/>

            {!selectedUserFundingStreamPermissions &&
            <Title title={pageTitle}
                   description="Assign and view permissions for users of Calculate funding service"
                   includeBackLink={true}
            />
            }
            {!!selectedUserFundingStreamPermissions &&
            <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                    <BackLink handleOnClick={onCancelEdit}/>
                </div>
            </div>
            }
            {fundingStreamsForAdmin?.length === 0 &&
            <WarningText
                text="You don't have any admin permissions"
                className="govuk-!-margin-top-4"
            />
            }
            {!selectedUserFundingStreamPermissions && fundingStreamsForAdmin.length > 0 &&
            <section id="select-user-and-funding-stream" className="govuk-grid-row govuk-!-margin-top-2">
                <div className="govuk-grid-column-full">
                    <form id="criteria-form" onSubmit={onSubmitCriteria}>
                        <fieldset className="govuk-fieldset">
                            <div className="govuk-form-group">
                                <label className="govuk-label" id="user-permissions" htmlFor="user-select">
                                    Find the user for whom you wish to view, assign, or change permissions
                                </label>
                                <div id="user-select" className="autocomplete-wrapper">
                                    {users ?
                                        <AutoComplete suggestions={users}
                                                      callback={onUserSelected}/> :
                                        <LoadingFieldStatus title="Loading..."/>
                                    }
                                </div>
                            </div>
                            {user && <FundingStreamSelection
                                selectedFundingStream={selectedFundingStream}
                                fundingStreams={fundingStreamsForAdmin}
                                callback={onFundingStreamSelect}
                            />}
                            <button type="submit"
                                    className="govuk-button govuk-!-margin-right-1">
                                {isLoadingUserPermissions ? <>
                                    <span className="loader loader-small" role="alert" aria-live="assertive"/>
                                    {' '}
                                    Loading...</> : "Continue"}
                            </button>
                            <a className="govuk-button govuk-button--secondary"
                               data-module="govuk-button"
                               onClick={history.goBack}>
                                Cancel
                            </a>
                        </fieldset>
                    </form>
                </div>
            </section>
            }
            {selectedUserFundingStreamPermissions &&
            <section>
                <div className="govuk-grid-row govuk-!-margin-top-5">
                    <div className="govuk-grid-column-full">
                        <div className="govuk-form-group">
                            <fieldset className="govuk-fieldset" aria-describedby="funding-stream-permissions-hint">
                                <legend className="govuk-fieldset__legend govuk-fieldset__legend--l">
                                    <h1 className="govuk-fieldset__heading">
                                        Set and view user permissions
                                    </h1>
                                </legend>
                                <div id="funding-stream-permissions-hint" className="govuk-hint govuk-!-margin-bottom-7">
                                    Assign and view permissions for {user?.name} for {' '}
                                    {selectedFundingStream?.name}{' '}funding stream.
                                </div>
                                {permissionsToShow.map((p, index) =>
                                    <UserPermissionDisplay
                                        key={index}
                                        permission={p}
                                        enabledPermissions={selectedUsersEnabledPermissions}
                                    />
                                )}
                            </fieldset>
                        </div>
                    </div>
                </div>
                <div className="govuk-grid-row">
                    <div className="govuk-grid-columns-two-thirds">
                        <button onClick={onSaveUserPermissions}
                                disabled={isSaving || isRemoving}
                                className="govuk-button govuk-!-margin-right-1"
                                data-module="govuk-button">
                            {isSaving ? <>
                                <span className="loader loader-small" role="alert" aria-live="assertive"/>
                                {' '}
                                Saving...</> : "Apply permissions"}
                        </button>
                        <button onClick={onCancelEdit}
                                className="govuk-button govuk-button--secondary govuk-!-margin-right-1">
                            Back
                        </button>
                        <button onClick={onRemoveUserPermissions}
                                disabled={isSaving || isRemoving}
                                className="govuk-button govuk-button--warning govuk-!-margin-right-1">
                            {isRemoving ? <>
                                <span className="loader loader-small" role="alert" aria-live="assertive"/>
                                {' '}
                                Removing...</> : "Remove user permissions"}
                        </button>
                    </div>
                </div>
            </section>
            }
        </Main>
    )
}
