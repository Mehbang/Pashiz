import intl from 'react-intl-universal';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from 'react';

export type EntityColumnField = {
  key: string;
  name: string;
  required?: boolean;
  hint?: string;
  group?: string;
};

export interface EntityColumn {
  groupKey: string;
  groupLabel: string;
  fields: EntityColumnField[];
}
export type SheetColumn = string;
export type SheetMap = { from: string; to: string };

interface ImportFileContextValue {
  sheetColumns: SheetColumn[];
  setSheetColumns: Dispatch<SetStateAction<SheetColumn[]>>;

  entityColumns: EntityColumn[];
  setEntityColumns: Dispatch<SetStateAction<EntityColumn[]>>;

  sheetMapping: SheetMap[];
  setSheetMapping: Dispatch<SetStateAction<SheetMap[]>>;

  step: number;
  setStep: Dispatch<SetStateAction<number>>;

  importId: string;
  setImportId: Dispatch<SetStateAction<string>>;

  resource: string;
  description?: string;
  params: Record<string, unknown>;
  onImportSuccess?: () => void;
  onImportFailed?: () => void;
  onCancelClick?: () => void;
  sampleFileName?: string;

  exampleDownload?: boolean;
  exampleTitle?: string;
  exampleDescription?: string;
}
interface ImportFileProviderProps {
  resource: string;
  description?: string;
  params?: Record<string, unknown>;
  onImportSuccess?: () => void;
  onImportFailed?: () => void;
  onCancelClick?: () => void;
  children: React.ReactNode;
  sampleFileName?: string;

  exampleDownload?: boolean;
  exampleTitle?: string;
  exampleDescription?: string;
}

const ImportFileContext = createContext<ImportFileContextValue>(
  {} as ImportFileContextValue,
);

export const useImportFileContext = () => {
  const context = useContext<ImportFileContextValue>(ImportFileContext);

  if (!context) {
    throw new Error(
      'useImportFileContext must be used within an ImportFileProvider',
    );
  }
  return context;
};

export const ImportFileProvider = ({
  resource,
  children,
  description,
  params = {},
  onImportFailed,
  onImportSuccess,
  onCancelClick,
  sampleFileName,

  exampleDownload = true,
  exampleTitle,
  exampleDescription,
}: ImportFileProviderProps) => {
  // Resolved here rather than as default parameter values: `intl.get()` at
  // module scope runs before the locale is loaded and returns nothing.
  const resolvedExampleTitle = exampleTitle ?? intl.get('import.example_title');
  const resolvedExampleDescription =
    exampleDescription ?? intl.get('import.example_description');

  const [sheetColumns, setSheetColumns] = useState<SheetColumn[]>([]);
  const [entityColumns, setEntityColumns] = useState<EntityColumn[]>([]);
  const [sheetMapping, setSheetMapping] = useState<SheetMap[]>([]);
  const [importId, setImportId] = useState<string>('');

  const [step, setStep] = useState<number>(0);

  const value = {
    sheetColumns,
    setSheetColumns,

    entityColumns,
    setEntityColumns,

    sheetMapping,
    setSheetMapping,

    step,
    setStep,

    importId,
    setImportId,

    resource,
    description,
    params,

    onImportSuccess,
    onImportFailed,
    onCancelClick,

    sampleFileName,

    exampleDownload,
    exampleTitle: resolvedExampleTitle,
    exampleDescription: resolvedExampleDescription,
  };

  return (
    <ImportFileContext.Provider value={value}>
      {children}
    </ImportFileContext.Provider>
  );
};
