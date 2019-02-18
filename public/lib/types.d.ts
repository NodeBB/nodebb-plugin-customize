declare type Callback<T = void> = (result: T) => void;

interface Window {
  config: {
    relative_path: string;
    'cache-buster': string;
    userLang: string;
  };
  app: {
    alertSuccess(message?: string): void;
    alertError(message?: string): void;
    alertError(error: Error): void;
  };
  utils: {
    generateUUID(): string;
  };
  ajaxify: {
    data: any;
  };
  bootbox: {
    confirm: (message: string, callback: (yes: boolean) => void) => void;
  };
}

interface String {
  startsWith(str: string): boolean;
}

declare module 'translator' {
  interface TranslationMap {
    [key: string]: string;
  }

  /* eslint-disable no-dupe-class-members */
  export class Translator {
    public static create(lang?: string): Translator;

    public translate(input: string): Promise<string>;

    public getTranslation(namespace: string): Promise<TranslationMap>;

    public getTranslation(namespace: string, key?: string): Promise<string>;

    public static unescape(escaped: string): string;
  }
  export function translate(input: string, callback: Callback<string>): void;
}
declare module 'benchpress' {
  export function render(template: string, data: any): Promise<string>;
}
declare module 'ace/ace' {
  const Ace: AceAjax.Ace;
  export = Ace;
}
