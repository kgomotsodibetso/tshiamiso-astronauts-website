// PayFast builds its signatures with PHP's urlencode(): spaces become "+", and every character except
// letters, digits and "-", "_", "." is %-encoded in upper case. JavaScript's encodeURIComponent leaves
// ! ' ( ) * ~ alone, so a name or address such as "O'Brien" would sign differently on our side.
export const phpUrlencode = (value: string): string =>
  encodeURIComponent(value)
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, "+");
