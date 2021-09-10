import * as React from "react";

import { ReportMetadataViewModel } from "../../types/Specifications/ReportMetadataViewModel";
import { DateTimeFormatter } from "../DateTimeFormatter";

export interface DownloadableReportItemProps {
  itemKey: string;
  reportMetadataViewModel: ReportMetadataViewModel;
}

export function DownloadableReportItem(props: DownloadableReportItemProps) {
  return (
    <div
      key={`grouplevel-${props.itemKey}`}
      className={"attachment__container"}
      ref={props.reportMetadataViewModel.customRef}
    >
      <div className="attachment__thumbnail" key={`attachment-${props.itemKey}`}>
        <a
          href={`/api/specs/${props.reportMetadataViewModel.specificationReportIdentifier}/download-report`}
          className="govuk-link"
          target="_self"
          aria-hidden="true"
        >
          <svg
            className="attachment__thumbnail-image thumbnail-image-small "
            version="1.1"
            viewBox="0 0 99 140"
            width="99"
            height="140"
            aria-hidden="true"
          >
            <path
              d="M12 12h75v27H12zm0 47h18.75v63H12zm55 2v59H51V61h16m2-2H49v63h20V59z"
              strokeWidth="0"
            ></path>
            <path
              d="M49 61.05V120H32.8V61.05H49m2-2H30.75v63H51V59zm34 2V120H69.05V61.05H85m2-2H67v63h20V59z"
              strokeWidth="0"
            ></path>
            <path
              d="M30 68.5h56.5M30 77.34h56.5M30 112.7h56.5M30 95.02h56.5M30 86.18h56.5M30 103.86h56.5"
              fill="none"
              strokeMiterlimit={"10"}
              strokeWidth="2"
            ></path>
          </svg>
        </a>
      </div>
      <div className="attachment__details" key={`attachment-details-${props.itemKey}`}>
        <h4 className="govuk-heading-s">
          <a
            className="govuk-link"
            target="_self"
            href={`/api/specs/${props.reportMetadataViewModel.specificationReportIdentifier}/download-report`}
          >
            {props.reportMetadataViewModel.name}
          </a>
        </h4>
        <p className="govuk-body-s">
          <span>{props.reportMetadataViewModel.format}</span>,{" "}
          <span>{props.reportMetadataViewModel.size}</span>, Updated:{" "}
          <span>
            <DateTimeFormatter date={props.reportMetadataViewModel.lastModified} />
          </span>
        </p>
      </div>
    </div>
  );
}
