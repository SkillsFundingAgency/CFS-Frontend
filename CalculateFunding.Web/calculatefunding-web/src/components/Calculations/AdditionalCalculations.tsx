import "../../styles/SortableTable.scss";

import SortableButton from "components/SortableButton";
import { cloneDeep } from "lodash";
import * as React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useCalculationCircularDependencies } from "../../hooks/Calculations/useCalculationCircularDependencies";
import { useSpecificationPermissions } from "../../hooks/Permissions/useSpecificationPermissions";
import { ErrorProps } from "../../hooks/useErrors";
import { searchForCalculationsByProviderService } from "../../services/calculationService";
import { getAdditionalCalculationsForSpecificationService } from "../../services/specificationService";
import { CalculationSearchResultResponse, CalculationType } from "../../types/CalculationSearchResponse";
import { Permission } from "../../types/Permission";
import { ValueType } from "../../types/ValueType";
import { DateTimeFormatter } from "../DateTimeFormatter";
import { formatNumber, NumberType } from "../FormattedNumber";
import { LoadingFieldStatus } from "../LoadingFieldStatus";
import { LoadingStatus } from "../LoadingStatus";
import { TableNavBottom } from "../TableNavBottom";
import { TextLink } from "../TextLink";

export interface AdditionalCalculationsProps {
  specificationId: string;
  providerId?: string;
  showCreateButton: boolean;
  addError: (err: ErrorProps) => void;
}

export function AdditionalCalculations({
  specificationId,
  providerId,
  showCreateButton,
  addError,
}: AdditionalCalculationsProps) {
  const [additionalCalculations, setAdditionalCalculations] = useState<CalculationSearchResultResponse>();
  const [additionalCalculationsSearchTerm, setAdditionalCalculationSearchTerm] = useState("");
  const [isLoadingAdditionalCalculations, setIsLoadingAdditionalCalculations] = useState(false);
  const [statusFilter] = useState("");
  const [sortBy, setSortBy] = useState<string>("name asc");
  const { isPermissionsFetched, hasMissingPermissions } = useSpecificationPermissions(specificationId, [
    Permission.CanEditCalculations,
  ]);
  const { circularReferenceErrors, isLoadingCircularDependencies } = useCalculationCircularDependencies(
    specificationId,
    (err) => addError({ error: err, description: "Error while checking for circular reference errors" })
  );
  const firstPage = 1;

  useEffect(() => {
    movePage(firstPage);
  }, [specificationId, sortBy]);

  function renderValue(value: number | null | undefined, calculationType: ValueType): string {
    if (!value) return "Excluded";
    switch (calculationType) {
      case ValueType.Currency:
        return formatNumber(value, NumberType.FormattedMoney, 0, false);
      case ValueType.Percentage:
        return formatNumber(value, NumberType.FormattedPercentage, 0, false);
      case ValueType.Number:
        return formatNumber(value, NumberType.FormattedDecimalNumber, 0, false);
    }
    return `${value}`;
  }

  async function movePage(pageNumber: number) {
    await findAdditionalCalculations(
      specificationId,
      statusFilter,
      pageNumber,
      additionalCalculationsSearchTerm
    );
  }

  async function findAdditionalCalculations(
    specificationId: string,
    status: string,
    pageNumber: number,
    searchTerm: string
  ) {
    if (!isLoadingAdditionalCalculations) {
      setIsLoadingAdditionalCalculations(true);
    }
    try {
      if (providerId) {
        const additionalCalculationsResponse = (
          await searchForCalculationsByProviderService(
            {
              specificationId: specificationId,
              status: status,
              pageNumber: pageNumber,
              searchTerm: searchTerm,
              orderBy: [sortBy],
              calculationType: "Additional",
            },
            providerId
          )
        ).data;

        const mappedResults: CalculationSearchResultResponse = {
          totalCount: additionalCalculationsResponse.totalCount,
          totalResults: additionalCalculationsResponse.totalResults,
          totalErrorResults: additionalCalculationsResponse.totalErrorResults,
          currentPage: additionalCalculationsResponse.currentPage,
          lastPage: additionalCalculationsResponse.lastPage,
          startItemNumber: additionalCalculationsResponse.startItemNumber,
          endItemNumber: additionalCalculationsResponse.endItemNumber,
          pagerState: cloneDeep(additionalCalculationsResponse.pagerState),
          facets: cloneDeep(additionalCalculationsResponse.facets),
          calculations: cloneDeep(additionalCalculationsResponse.calculations),
        };

        setAdditionalCalculations(mappedResults);
      } else {
        getAdditionalCalculationsForSpecificationService({
          specificationId: specificationId,
          status: status,
          pageNumber: pageNumber,
          searchTerm: searchTerm,
          orderBy: [sortBy],
          calculationType: CalculationType.Additional,
        }).then((response) => {
          setAdditionalCalculations(response.data);
        });
      }
    } catch (err: any) {
      addError({
        error: err,
        description: "Error while fetching additional calculations",
        fieldName: "additional-calculations",
      });
    } finally {
      setIsLoadingAdditionalCalculations(false);
    }
  }

  function sortByValue(sortType: string) {
    switch (sortBy) {
      case `${sortType} asc`:
        setSortBy(`${sortType} desc`);
        break;
      case `${sortType} desc`:
        setSortBy(`${sortType} asc`);
        break;
      default:
        setSortBy(`${sortType} asc`);
        break;
    }
  }

  function searchByText(specificationId: string, status: string, pageNumber: number, searchTerm: string) {
    findAdditionalCalculations(specificationId, status, pageNumber, searchTerm);
  }

  return (
    <section className="govuk-tabs__panel" id="additional-calculations">
      {isLoadingAdditionalCalculations && (
        <LoadingStatus title="Loading additional calculations" description="Please wait" />
      )}
      {!isLoadingAdditionalCalculations && additionalCalculations && (
        <div className="govuk-grid-row" hidden={isLoadingAdditionalCalculations}>
          <div className="govuk-grid-column-two-thirds">
            <h2 className="govuk-heading-l">Additional calculations</h2>
          </div>
          <div className="govuk-grid-column-one-third">
            <Link
              to={`/Specifications/CreateAdditionalCalculation/${specificationId}`}
              className="govuk-link govuk-link--no-visited-state"
            >
              Create additional calculation
            </Link>
          </div>
        </div>
      )}
      <div className="govuk-grid-row" hidden={isLoadingAdditionalCalculations}>
        <div className="govuk-grid-column-two-thirds">
          <div className="govuk-form-group search-container">
            <input
              className="govuk-input input-search"
              id="event-name"
              name="event-name"
              type="text"
              onChange={(e) => setAdditionalCalculationSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="govuk-grid-column-one-third">
          <button
            className="govuk-button"
            type="submit"
            onClick={() => searchByText(specificationId, statusFilter, 1, additionalCalculationsSearchTerm)}
          >
            Search
          </button>
        </div>
      </div>

      {!isLoadingAdditionalCalculations && additionalCalculations && (
        <table className="govuk-table">
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th scope="col" className="govuk-table__header">
                <SortableButton
                  title={"Additional calculation name"}
                  sortName={"name"}
                  callback={sortByValue}
                  sortAsc={true}
                />
              </th>
              {!providerId && (
                <th scope="col" className="govuk-table__header">
                  <SortableButton callback={sortByValue} sortName={"status"} title={"Status"} />
                </th>
              )}
              <th scope="col" className="govuk-table__header">
                <SortableButton callback={sortByValue} sortName={"valueType"} title={"Type"} />
              </th>
              {providerId && (
                <th scope="col" className="govuk-table__header">
                  <SortableButton callback={sortByValue} sortName={"valueType"} title={"Value"} />
                </th>
              )}
              {!providerId && (
                <th scope="col" className="govuk-table__header">
                  <SortableButton
                    callback={sortByValue}
                    sortName={"lastUpdatedDate"}
                    title={"Last edited date"}
                  />
                </th>
              )}
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {additionalCalculations.calculations?.map((ac, index) => {
              const hasError =
                circularReferenceErrors &&
                circularReferenceErrors.some((error) => error.node.calculationid === ac.id);
              const linkUrl = showCreateButton
                ? `/Specifications/EditCalculation/${ac.id}`
                : `/ViewCalculationResults/${ac.id}`;
              return (
                <tr className="govuk-table__row" key={index}>
                  <td className="govuk-table__cell text-overflow">
                    <Link
                      className={`govuk-link govuk-link--no-visited-state ${
                        ac.exceptionMessage ? "govuk-form-group--error" : ""
                      }`}
                      to={linkUrl}
                    >
                      {ac.name}
                    </Link>
                    {ac.exceptionMessage ? (
                      <span className={"govuk-error-message"}>{ac.exceptionMessage}</span>
                    ) : (
                      ""
                    )}
                    <br />
                    {hasError ? (
                      <span className="govuk-error-message">
                        circular reference detected in calculation script
                      </span>
                    ) : (
                      ""
                    )}
                  </td>

                  {!providerId && (
                    <td className="govuk-table__cell">
                      {isLoadingCircularDependencies ? (
                        <LoadingFieldStatus title="Checking..." />
                      ) : hasError ? (
                        "Error"
                      ) : (
                        ac.status
                      )}
                    </td>
                  )}
                  <td className="govuk-table__cell">
                    {ac.exceptionMessage == null ? (
                      ac.valueType
                    ) : (
                      <span className="govuk-error-message">Error</span>
                    )}
                  </td>
                  {providerId && (
                    <td className="govuk-table__cell">
                      {renderValue(ac.value, ac.valueType)}
                    </td>
                  )}
                  {!providerId && (
                    <td className="govuk-table__cell">
                      <DateTimeFormatter date={ac.lastUpdatedDate} />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {!isLoadingAdditionalCalculations && additionalCalculations && (
        <>
          {additionalCalculations.calculations.length === 0 && (
            <div className="govuk-warning-text">
              <span className="govuk-warning-text__icon" aria-hidden="true">
                !
              </span>
              <strong className="govuk-warning-text__text">
                <span className="govuk-warning-text__assistive">Warning</span>
                No additional calculations available. &nbsp;
                {isPermissionsFetched && !hasMissingPermissions && showCreateButton && (
                  <TextLink to={`/specifications/CreateAdditionalCalculation/${specificationId}`}>
                    Create a calculation
                  </TextLink>
                )}
              </strong>
            </div>
          )}
          {additionalCalculations.calculations.length > 0 &&
            isPermissionsFetched &&
            !hasMissingPermissions &&
            showCreateButton && (
              <div className="govuk-grid-row">
                <div className="govuk-grid-column-full">
                  <Link
                    to={`/specifications/CreateAdditionalCalculation/${specificationId}`}
                    className="govuk-link govuk-button"
                  >
                    Create a calculation
                  </Link>
                </div>
              </div>
            )}
        </>
      )}
      <TableNavBottom
        currentPage={additionalCalculations?.currentPage}
        lastPage={additionalCalculations?.pagerState.lastPage}
        totalCount={additionalCalculations?.totalResults}
        startItemNumber={additionalCalculations?.startItemNumber}
        endItemNumber={additionalCalculations?.endItemNumber}
        onPageChange={movePage}
      />
    </section>
  );
}
