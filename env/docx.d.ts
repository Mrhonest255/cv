declare module 'docx' {
  export class Document {
    constructor(options: any);
  }
  export class Packer {
    static toBlob(doc: Document): Promise<Blob>;
  }
  export class Paragraph {
    constructor(options: any);
  }
  export class TextRun {
    constructor(options: any);
  }
  export enum HeadingLevel {
    TITLE = 'Title',
    HEADING_1 = 'Heading1',
    HEADING_2 = 'Heading2',
    HEADING_3 = 'Heading3',
  }
  export enum AlignmentType {
    CENTER = 'center',
    LEFT = 'left',
    RIGHT = 'right',
    JUSTIFIED = 'both',
  }
  export enum UnderlineType {
    SINGLE = 'single',
    DOUBLE = 'double',
  }
}
