declare type Callback<T = void> = (result: T) => void;

declare const config: {
  // eslint-disable-next-line camelcase
  relative_path: string;
  'cache-buster': string;
  userLang: string;
};
declare const utils: {
  generateUUID(): string;
};
declare const ajaxify: {
  data: any;
};

interface String {
  startsWith(str: string): boolean;
}

declare module 'alerts' {
  function success(message?: string): void;
  function error(message?: string): void;
  function error(err: Error): void;
}

declare module 'bootbox' {
  export const confirm: (message: string, callback: (yes: boolean) => void) => void;
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

declare module 'api' {
  export function get(route: string, payload: NonNullable<unknown>): Promise<any>;
  export function head(route: string, payload: NonNullable<unknown>): Promise<any>;
  export function post(route: string, payload: NonNullable<unknown>): Promise<any>;
  export function put(route: string, payload: NonNullable<unknown>): Promise<any>;
  export function del(route: string, payload: NonNullable<unknown>): Promise<any>;
}
