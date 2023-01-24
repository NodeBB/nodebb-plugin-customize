import * as alerts from 'alerts';
import * as bootbox from 'bootbox';

export function setOptions(select: JQuery, options: {
  value: string;
  text: string;
}[]): void {
  select.empty();

  options.forEach(({ value, text }) => {
    $('<option>')
      .attr({ value })
      .text(text)
      .appendTo(select);
  });
}

export function success(): void {
  alerts.success();
}
export function error(err: Error): void {
  alerts.error(err);
  setTimeout(() => { throw err; }, 0);
}

export function confirm(message: string): Promise<boolean> {
  return new Promise(
    (resolve) => { bootbox.confirm(message, resolve); }
  );
}

export function unescape(escaped: string): string {
  return $('<span>').html(escaped).text();
}
