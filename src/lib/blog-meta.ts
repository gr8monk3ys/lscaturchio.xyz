import * as ts from "typescript";

export interface BlogMeta {
  title: string;
  description: string;
  date: string;
  updated?: string;
  image: string;
  tags: string[];
  series?: string;
  seriesOrder?: number;
}

type PartialBlogMeta = Partial<BlogMeta>;

function getPropertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNoSubstitutionTemplateLiteral(name)) {
    return name.text;
  }
  return null;
}

function getMetaObject(content: string): ts.ObjectLiteralExpression | null {
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
        return declaration.initializer;
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

export function extractBlogMeta(content: string): PartialBlogMeta {
  const metaObject = getMetaObject(content);
  if (!metaObject) {
    return {};
  }

  return {
    title: readStringValue(getMetaPropertyExpression(metaObject, "title")),
    description: readStringValue(getMetaPropertyExpression(metaObject, "description")),
    date: readStringValue(getMetaPropertyExpression(metaObject, "date")),
    updated: readStringValue(getMetaPropertyExpression(metaObject, "updated")),
    image: readStringValue(getMetaPropertyExpression(metaObject, "image")),
    tags: readStringArray(getMetaPropertyExpression(metaObject, "tags")),
    series: readStringValue(getMetaPropertyExpression(metaObject, "series")),
    seriesOrder: readNumberValue(getMetaPropertyExpression(metaObject, "seriesOrder")),
  };
}

