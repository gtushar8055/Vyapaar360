import { Document, Page } from "@react-pdf/renderer";

export default function InvoicePDF({ saleId }) {
  return (
    <Document>
      <Page size="A4">
        {/* 
          IMPORTANT
          This component ONLY embeds backend PDF.
          Backend is the single source of truth.
        */}
      </Page>
    </Document>
  );
}
