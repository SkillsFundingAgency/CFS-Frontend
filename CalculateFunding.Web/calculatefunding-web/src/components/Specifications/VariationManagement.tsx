import { AxiosError } from "axios";
import * as React from "react";
import { useState } from "react";
import { useQuery } from "react-query";

import { useErrorContext } from "../../context/ErrorContext";
import { useProfileVariationPointers } from "../../hooks/Variation/useProfileVariationPointers";
import { getAvailableFundingLinePeriods } from "../../services/publishService";
import { mergeProfileVariationPointersService } from "../../services/specificationService";
import { AvailableVariationPointerFundingLine } from "../../types/Publishing/AvailableVariationPointerFundingLine";
import { ProfileVariationPointer } from "../../types/Specifications/ProfileVariationPointer";
import ProfilePatternSelector from "../Funding/ProfilePatternSelector";
import { LoadingStatusNotifier } from "../LoadingStatusNotifier";
import { NoData } from "../NoData";

export interface VariationManagementProps {
  specificationId: string;
  fundingPeriodId: string;
  fundingStreamId: string;
}

export function VariationManagement({ specificationId, fundingPeriodId, fundingStreamId }: VariationManagementProps) {
  const { addErrorToContext: addError, clearErrorsFromContext: clearErrorMessages } = useErrorContext();
  const [updatedPointers, setUpdatedPointers] = useState<ProfileVariationPointer[] | undefined>();
  const [checkedFundlingLines, setCheckedFundlingLines] = useState(new Array());
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [showWarningMessage, setShowWarningMessage] = useState<boolean>(false);
  const [showSucessMessage, setSucessMessage] = useState<boolean>(false);
  const [disableBulkAction, setDisableBulkAction] = useState<boolean>(true);

  const { profileVariationPointers, isFetchingVariationManagement } = useProfileVariationPointers({
    specificationId,
    enabled: !!specificationId?.length,
    onSuccess: () => clearErrorMessages(),
    onError: (err) =>
      addError({
        error: err.message,
        description: "Error while loading available funding lines",
      }),
  });
  const {
    data: availableFundingLines,
    isFetching: isFetchingAvailableFundingLines,
    refetch,
  } = useQuery<AvailableVariationPointerFundingLine[], AxiosError>(
    `available-funding-periods-${specificationId}`,
    async () => (await getAvailableFundingLinePeriods(specificationId)).data,
    {
      enabled: !!specificationId?.length,
      onError: (err) =>
        addError({
          error: err.message,
          description: "Error while loading available funding lines",
        })
    }
  );

  const showBulkActionUpdate = availableFundingLines && availableFundingLines.length > 5;

  const getMonthsForBulkActionUpdate = () => {     
    let monthsForBulkActionUpdate:string[] = [];
    // populating dropdown options from the available funding lines option
    availableFundingLines?.forEach((p) => {
      p.periods.forEach((pp) => {
        const instalment = pp.period + " " + pp.year + " Instalment " + pp.occurrence;
        if(!monthsForBulkActionUpdate.includes(instalment)){
            monthsForBulkActionUpdate.push(instalment);
        }
      });
    });

    const sorter = (firstData:any, secondData:any) => {
      var as = firstData.split(' '),
      bs = secondData.split(' '),
      ad = new Date(as[0] + ' 1,' + as[1]),
      bd = new Date(bs[0] + ' 1,' + bs[1]);
      return ad.getTime() - bd.getTime();
    }

    monthsForBulkActionUpdate.sort(sorter);
    return monthsForBulkActionUpdate;
  }  

  const setBulkVariationPointer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    clearSelection();   
    setShowWarningMessage(false); 
    setSucessMessage(false);
    const bulkActionSelectedOption = e.target.value;
    if(bulkActionSelectedOption == "" ){      
      setUpdatedPointers(undefined);
    }
    if(bulkActionSelectedOption !== "" && checkedFundlingLines.length) {
      let updatedCollection: ProfileVariationPointer[] = [];
      let setPointerCount = 0;
      checkedFundlingLines.forEach((cfl) => {
        const currentInstalment = document.querySelector('#currentInstalment-'+ cfl) as HTMLSpanElement;
        const select = document.querySelector('#variationPointerSelect-' + cfl) as HTMLSelectElement;
        const options = Array.from(select?.options); 
        const optionsToSelect = options.find(item => item.text === bulkActionSelectedOption) as HTMLOptionElement;   
        if(optionsToSelect == undefined || optionsToSelect.innerText.toString() == "") {
          setUpdatePointerIfBulkActionOptionNA(cfl);
        }
        else if(currentInstalment.innerText.toString() !== optionsToSelect.innerText.toString())  
        {            
            setPointerCount++;
            optionsToSelect.selected = true;
            const pointer = availableFundingLines?.find((fl) => fl.fundingLineCode === cfl) as AvailableVariationPointerFundingLine;
            const pointerPattern = getPointerPattern(optionsToSelect.value, pointer);          
        
            updatedCollection = updatedPointers === undefined ? updatedCollection : updatedPointers;
            const i = updatedCollection.findIndex((x) => x.fundingLineId == pointerPattern.fundingLineId, 0);
            if (i > -1) {
              updatedPointers?.splice(i, 1);
            }

            if(optionsToSelect.value === ""){
              setUpdatedPointers(updatedCollection);
              return;
            }        

            updatedCollection?.push(pointerPattern);
            setUpdatedPointers(updatedCollection);
        }
      });
      // show warning message if checkedfundinglines count is not matched with future instalment selected count
      if(setPointerCount !== checkedFundlingLines.length){
        setShowWarningMessage(true);
      }      
    }
  };

  const setUpdatePointerIfBulkActionOptionNA = (fundlingLine: string) => {
    const pointers = updatedPointers === undefined ? [] : updatedPointers;
    const i = pointers.findIndex((x) => x.fundingLineId == fundlingLine, 0);
    if (i > -1) {
      updatedPointers?.splice(i, 1);
    }  
  }

  const clearSelection = () => {
    if(checkedFundlingLines.length > 0) {
      checkedFundlingLines.forEach((fl) => {
        const $select = document.querySelector('#variationPointerSelect-' + fl) as HTMLSelectElement;
        const $options = Array.from($select?.options);        
        $options?.forEach((p) => p.selected = false);        
      });
    }
  }  

  const resetBulkActionUpdates = () => {
    setShowWarningMessage(false);
    if(showBulkActionUpdate && checkedFundlingLines.length > 0) {
      setSelectAll(false);
      const $select = document.querySelector('#bulkvariationPointerSelect') as HTMLSelectElement;
      const $options = Array.from($select?.options);        
      $options.forEach((p) => p.selected = false); 
      setDisableBulkAction(true);
      clearSelection();
      setCheckedFundlingLines(new Array());
    }
  }

  const handleToggleAllFundingLines = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showBulkActionUpdate) {
      const checked = e.target.checked;
      const fundingLines = new Array();
      setSucessMessage(false);
      setSelectAll(checked);
      setDisableBulkAction(true);
      if(checked) {
        setDisableBulkAction(false);
        availableFundingLines.forEach((fundingLine) => {
          fundingLines.push(fundingLine.fundingLineCode);
        });
      }
      else{
        resetForm();
      }
      setCheckedFundlingLines(fundingLines);
    }
  };

  const handleItemSelectionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const fundingLineCode = e.target.value;
    let fundingLines = checkedFundlingLines;
    setSucessMessage(false);
    if(!checked)
    {
      setCheckedFundlingLines(fundingLines.filter((p) => p != fundingLineCode));    
      if(checkedFundlingLines.length <= 1) {
          setSelectAll(false);
          setDisableBulkAction(true);
      }
    }
    else{
      fundingLines?.push(fundingLineCode);
      setCheckedFundlingLines(prevFundingLines=>[...prevFundingLines, ...fundingLines]); 
    }
  };

  const getPointerPattern = (pattern: string, pointer: AvailableVariationPointerFundingLine) =>{
    const splitPattern = pattern.split("-");

    const pointerPattern: ProfileVariationPointer = {
      fundingLineId: pointer.fundingLineCode,
      fundingStreamId: fundingStreamId,
      typeValue: splitPattern[1],
      year: parseInt(splitPattern[0]),
      periodType: "CalendarMonth",
      occurrence: parseInt(splitPattern[2]),
    };

    return pointerPattern;
  }
  
  function setPointer(pattern: string, pointer: AvailableVariationPointerFundingLine) {    
    setSucessMessage(false);
    const pointerPattern = getPointerPattern(pattern, pointer);

    const updatedCollection = updatedPointers === undefined ? [] : updatedPointers;
    const i = updatedCollection.findIndex((x) => x.fundingLineId == pointerPattern.fundingLineId, 0);
    if (i > -1) {
      updatedPointers?.splice(i, 1);
    }

    if(pattern === ""){
      setUpdatedPointers(updatedCollection);
      return;
    }
    updatedCollection?.push(pointerPattern);
    setUpdatedPointers(updatedCollection);
  }  

  const resetForm = () => {
    setSucessMessage(false);
    setUpdatedPointers(undefined);
    resetBulkActionUpdates();
  }

  async function updatePointers(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    clearErrorMessages();
    e.preventDefault();        
    try {      
      if (updatedPointers) {       
        await mergeProfileVariationPointersService(specificationId, updatedPointers).then(() => {
          setUpdatedPointers(undefined);
          setCheckedFundlingLines(new Array());
          resetBulkActionUpdates();
          setSucessMessage(true);
          refetch();
          window.scrollTo({ top: 0, behavior: 'smooth' });          
        });        
      }else{
        setSucessMessage(false);
      }
    } catch (e: any) {
      addError({
        error: e,
        description: "Error while trying to update variation pointers",
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const haveDataToShow: boolean =
    !!profileVariationPointers &&
    profileVariationPointers.length > 0 &&
    !isFetchingVariationManagement &&
    !isFetchingAvailableFundingLines;
    const count : any = availableFundingLines?.length;
  
    const VariationSuccessMassage = () => {     
        return (
          <div className="govuk-notification-banner__content">
            <p className="govuk-heading-s">
              Variation{count > 1 && ("s")} set
            </p>             
          </div>)
    }  

    const SectionForBulkActionOr5Lines =()=>{      
      if(count < 5){
        return(
          <div>
            <h2 className="govuk-heading-l">Set a variation</h2>
            <p className="govuk-body">Choose instalment for the variation to start in.</p>
            <p className="govuk-body">Select an option from the future instalment drop-down next to the funding line.</p>
            <p className="govuk-body">If you do not select a future instalment for a funding line, the currently set instalment will stay the same.</p>
          </div>
        )
      }else {
        return(
          <div>
            <h2 className="govuk-heading-l">Set a variation</h2>
            <p className="govuk-body">Choose instalment for the variation to start in.</p>
            <p className="govuk-body">You can select future instalments for:</p> 
            <div className="govuk-list">           
              <li className="govuk-body govuk-list--bullet">individual funding lines</li>
              <li className="govuk-body govuk-list--bullet">all funding lines</li>
            </div>          
            <div className="govuk-!-padding-top-1">
              <details className="govuk-details" data-module="govuk-details" >
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Select an instalment for individual funding lines</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">Select an option from the future instalment drop-down next to the funding line.</p>
                  <p className="govuk-body">If you do not select a future instalment for a funding line, the currently set instalment will stay the same.</p> 
                </div>
              </details>
            </div>
            <div className="govuk-!-padding-top-1">
              <details className="govuk-details" data-module="govuk-details" >
                <summary className="govuk-details__summary">
                  <span className="govuk-details__summary-text">Select an instalment for all funding lines</span>
                </summary>
                <div className="govuk-details__text">
                  <p className="govuk-body">You must check the select all box before you select a future instalment for all funding lines.</p>
                </div>
              </details>
            </div>
            <p className="govuk-caption-m">Select a future instalment for all funding lines</p>
          </div>
      )}
    }
  
  return (
    <section className="govuk-tabs__panel" id="variation-management">
      <LoadingStatusNotifier
        notifications={[
          {
            isActive: isFetchingVariationManagement,
            title: "Loading variation management",
            description: "Please wait whilst variation management is loading",
          },
          {
            isActive: isFetchingAvailableFundingLines,
            title: "Loading available funding lines",
            description: "Please wait",
          },
        ]}
      />
      {!haveDataToShow ? (
        <div className="govuk-grid-row">
          <div className="govuk-grid-column-full" hidden={haveDataToShow}>
            <NoData excludeSearchTips={true} />
          </div>
        </div>
      ) : (
        <>
          {showSucessMessage && (
          <div className="govuk-notification-banner govuk-notification-banner--success" role="alert"
            aria-labelledby="govuk-notification-banner-title"
            data-module="govuk-notification-banner">
            <div className="govuk-notification-banner__header">
              <h2 className="govuk-notification-banner__title" id="govuk-notification-banner-title">
                Success
              </h2>
            </div>             
            <VariationSuccessMassage/> 
          </div>
          )}
          <div className="govuk-grid-column-full"> 
            <SectionForBulkActionOr5Lines/>      
          </div>
          {showBulkActionUpdate && ( 
              <BulkActionUpdateVariationPointers 
                disabled = {disableBulkAction}
                months={getMonthsForBulkActionUpdate()} 
                showWarningMessage = {showWarningMessage}
                setBulkVariationPointer = {setBulkVariationPointer}/>                
          )}
          <div className="govuk-grid-column-full">
            <h4 className="govuk-heading-M app-banner-title">Funding lines</h4>
            <form>
              <table className="govuk-table">
                <thead className="govuk-table__head">
                  <tr className="govuk-table__row">
                    {showBulkActionUpdate && (
                      <th className="govuk-table__header govuk-!-padding-top-0"> 
                        <div className="govuk-checkboxes govuk-checkboxes--small">
                          <div className="govuk-checkboxes__item">
                            <input
                              className="govuk-checkboxes__input"
                              id="toggle-all"
                              type="checkbox"
                              value="toggle-all"
                              checked={selectAll}
                              onChange={handleToggleAllFundingLines}
                            />
                            <label className="govuk-label govuk-checkboxes__label govuk-!-font-weight-bold nobr" htmlFor="toggle-all">
                              Select all
                            </label>
                          </div>
                        </div>
                    </th>
                    )}
                    <th className="govuk-table__header">Funding line{count > 1 && ("s")}</th>
                    <th className="govuk-table__header">Currently set instalment</th>
                    <th className="govuk-table__header">Future instalment</th>
                  </tr>
                </thead>
                <tbody className="govuk__body">
                  {availableFundingLines &&
                    availableFundingLines.map((pointer, index) => {
                      const period = pointer.selectedPeriod;
                      return (
                        <tr className="govuk-table__row" key={index}>                        
                        {showBulkActionUpdate && (
                        <td className="govuk-table__header">
                          <div className="govuk-checkboxes govuk-checkboxes--small">
                            <div className="govuk-checkboxes__item">
                                <input
                                  className="govuk-checkboxes__input"
                                  id={pointer.fundingLineCode}
                                  type="checkbox"
                                  value={pointer.fundingLineCode}
                                  checked={checkedFundlingLines.includes(pointer.fundingLineCode)}
                                  onChange={handleItemSelectionToggle}
                                /> 
                                <label className="govuk-label govuk-checkboxes__label" htmlFor={pointer.fundingLineCode}></label>
                              </div>
                            </div>
                          </td> 
                          )}                        
                          <td className="govuk-table__cell">
                            {pointer.fundingLineName} ({pointer.fundingLineCode})
                          </td>                         
                          <td className="govuk-table__cell">
                            {" "}
                            <span id={`currentInstalment-${pointer.fundingLineCode}`}>{!period ? "Initial allocation" : `${period.period} ${period.year} Instalment ${period.occurrence}`}</span>                           
                          </td>
                            <td className="govuk-table__cell">
                              <ProfilePatternSelector
                                profilePatternList={pointer.periods}
                                pointer={pointer}
                                callback={setPointer}
                              />
                            </td>
                        </tr>
                      );
                    })}
                  <tr>
                    <td colSpan={2}>
                      <button
                        className={"govuk-button govuk-!-margin-right-2 govuk-!-margin-top-7"}
                        onClick={(e) => updatePointers(e)}
                      >
                        Save changes
                      </button>
                      <button className={"govuk-button govuk-button--secondary govuk-!-margin-top-7"} type={"reset"} onClick={resetForm}>
                        Reset future instalments
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </form>
          </div> 
        </>
      )}
    </section>
  );
}

const BulkActionUpdateVariationPointers = ({
  disabled,
  months,
  showWarningMessage,
  setBulkVariationPointer
}: {
  disabled: boolean,
  months: string[];
  showWarningMessage: boolean;
  setBulkVariationPointer: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => ( 
    <div className={showWarningMessage ? "govuk-grid-column-full" : "govuk-grid-column-full govuk-!-margin-bottom-7"}>        
      <select
      name="bulkvariationPointerSelect"
      id="bulkvariationPointerSelect"
      className="govuk-select"
      disabled = {disabled}
      onChange={(e) => setBulkVariationPointer(e)}
      >
      <option key={-1} value="">Future instalment</option>
      {months &&
        months.map((pp, index) => (
          <option key={index} value={pp}>
            {pp}
          </option>
        ))}
    </select>     
    {showWarningMessage && (
      <div className="govuk-grid-row govuk-!-margin-top-7">
        <div className="govuk-grid-column-three-quarters">       
          <div className="govuk-warning-text govuk-!-margin-bottom-7">
            <span className="govuk-warning-text__icon" aria-hidden="true">
              !
            </span>            
            <strong className="govuk-warning-text__text">
              <span className="govuk-warning-text__assistive ">Warning</span>
                You cannot select this instalment for all funding lines because 
                it's already set, or is earlier than the currently set instalment
                for some funding lines. You can select a different instalment for all or individual
                funding lines.
            </strong>
          </div>
        </div>
      </div> 
    )}
  </div>
);
