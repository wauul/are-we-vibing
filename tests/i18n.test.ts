import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import french from "../src/lib/translations-fr.json";
import { translate, validLocale } from "../src/lib/i18n";

test("English and French preserve participant values and unknown session content", () => {
  const text = "A mix with {0}.";
  assert.equal(translate("en", text, {0:"Alex"}), "A mix with Alex.");
  assert.equal(translate("fr", text, {0:"Éléonore"}), "Un mix avec Éléonore.");
  assert.equal(translate("fr", "An existing AI verdict"), "An existing AI verdict");
  assert.equal(translate("fr", text), "Un mix avec {0}.");
  assert.ok(validLocale("en") && validLocale("fr"));
  assert.ok(!validLocale("de") && !validLocale(null));
});

test("every literal interface translation has a French entry with the same placeholders", () => {
  const dictionary = french as Record<string,string>;
  let checked = 0;
  function scan(directory: string) {
    for (const entry of fs.readdirSync(directory,{withFileTypes:true})) {
      const file = path.join(directory,entry.name);
      if (entry.isDirectory()) { if (entry.name !== "api") scan(file); continue; }
      if (!file.endsWith(".tsx")) continue;
      const ast = ts.createSourceFile(file,fs.readFileSync(file,"utf8"),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
      function walk(node: ts.Node) {
        let key: string | undefined;
        if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "t" && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) key = node.arguments[0].text;
        if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === "T") {
          const attribute = node.attributes.properties.find(p => ts.isJsxAttribute(p) && p.name.getText(ast) === "text");
          if (attribute && ts.isJsxAttribute(attribute) && attribute.initializer && ts.isJsxExpression(attribute.initializer) && attribute.initializer.expression && ts.isStringLiteral(attribute.initializer.expression)) key = attribute.initializer.expression.text;
        }
        if (key) { assert.ok(key in dictionary,`${file}: missing French for ${key}`); checked++; }
        ts.forEachChild(node,walk);
      }
      walk(ast);
    }
  }
  scan("src/app"); scan("src/components");
  assert.ok(checked > 150);
  for (const [key,value] of Object.entries(dictionary)) {
    assert.deepEqual([...key.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),[...value.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort(),`Placeholders: ${key}`);
  }
});
