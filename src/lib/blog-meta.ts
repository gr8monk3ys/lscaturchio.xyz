import * as ts from "typescript";
import { BlogStage, isBlogStage } from "@/lib/blog-stage";

export interface BlogMeta {
  title: string;
  description: string;
  date: string;
  updated?: string;
  image: string;
  tags: string[];
  /** Links to syndicated copies (e.g. Mastodon / Bluesky). */
  syndication?: string[];
  series?: string;
  seriesOrder?: number;
  /** Digital-garden maturity stage. */
  stage?: BlogStage;
}

type PartialBlogMeta = Partial<BlogMeta>;

function getPropertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) {
    return name.text;
  }
  return null;
}

/**
 * Where `export const meta = { ... }` sits in a source, as character offsets:
 * `start` is the `export` keyword, `end` is just past the closing `}`, or past
 * the `;` after it when there is one.
 */
export interface MetaExportSpan {
  start: number;
  end: number;
}

interface MetaExport {
  object: ts.ObjectLiteralExpression;
  span: MetaExportSpan;
}

function findMetaExport(content: string): MetaExport | null {
  const sourceFile = ts.createSourceFile(
    "content.mdx.tsx",
    content,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }

    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword
    );
    if (!isExported) {
      continue;
    }

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== "meta") {
        continue;
      }

      if (declaration.initializer && ts.isObjectLiteralExpression(declaration.initializer)) {
        return {
          object: declaration.initializer,
          span: { start: statement.getStart(sourceFile), end: statement.end },
        };
      }
    }
  }

  return null;
}

function getMetaPropertyExpression(
  metaObject: ts.ObjectLiteralExpression,
  propertyName: string
): ts.Expression | undefined {
  for (const property of metaObject.properties) {
    if (!ts.isPropertyAssignment(property)) {
      continue;
    }
    const name = getPropertyNameText(property.name);
    if (name === propertyName) {
      return property.initializer;
    }
  }
  return undefined;
}

function readStringValue(expr: ts.Expression | undefined): string | undefined {
  if (!expr) return undefined;
  if (ts.isStringLiteral(expr) || ts.isNoSubstitutionTemplateLiteral(expr)) {
    return expr.text;
  }
  return undefined;
}

function readNumberValue(expr: ts.Expression | undefined): number | undefined {
  if (!expr) return undefined;
  if (ts.isNumericLiteral(expr)) {
    return Number(expr.text);
  }
  return undefined;
}

function readStageValue(expr: ts.Expression | undefined): BlogStage | undefined {
  const value = readStringValue(expr);
  return isBlogStage(value) ? value : undefined;
}

function readStringArray(expr: ts.Expression | undefined): string[] | undefined {
  if (!expr || !ts.isArrayLiteralExpression(expr)) return undefined;

  const values = expr.elements
    .map((element) => {
      if (ts.isStringLiteral(element) || ts.isNoSubstitutionTemplateLiteral(element)) {
        return element.text;
      }
      return null;
    })
    .filter((value): value is string => value !== null);

  return values;
}

export interface ParsedMetaExport {
  /** Whatever fields parsed; empty when there is no meta export. */
  meta: PartialBlogMeta;
  /** Where the export sits, or null when there is none to find. */
  span: MetaExportSpan | null;
}

/**
 * The one parse of an essay's `export const meta`: its values, and where the
 * block is. Everything that skips, strips or rewrites "the meta block" asks
 * this, so nothing disagrees about where it ends. A nested object, a `}` inside
 * a string and a trailing `;` are the compiler's problem, not a regex's.
 */
export function parseMetaExport(content: string): ParsedMetaExport {
  const found = findMetaExport(content);
  if (!found) {
    return { meta: {}, span: null };
  }
  return { meta: readMeta(found.object), span: found.span };
}

function readMeta(metaObject: ts.ObjectLiteralExpression): PartialBlogMeta {
  return {
    title: readStringValue(getMetaPropertyExpression(metaObject, "title")),
    description: readStringValue(getMetaPropertyExpression(metaObject, "description")),
    date: readStringValue(getMetaPropertyExpression(metaObject, "date")),
    updated: readStringValue(getMetaPropertyExpression(metaObject, "updated")),
    image: readStringValue(getMetaPropertyExpression(metaObject, "image")),
    tags: readStringArray(getMetaPropertyExpression(metaObject, "tags")),
    syndication: readStringArray(getMetaPropertyExpression(metaObject, "syndication")),
    series: readStringValue(getMetaPropertyExpression(metaObject, "series")),
    seriesOrder: readNumberValue(getMetaPropertyExpression(metaObject, "seriesOrder")),
    stage: readStageValue(getMetaPropertyExpression(metaObject, "stage")),
  };
}
