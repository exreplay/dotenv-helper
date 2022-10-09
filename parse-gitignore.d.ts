declare module 'parse-gitignore' {
  function parse(input: string | Buffer): State;

  interface State {
    globs: () => GlobsResult[];
  }

  interface GlobsResult {
    type: string;
    patterns: string[];
  }
}
