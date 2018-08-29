"use strict";
import * as vscode from "vscode";
import { Decleration } from "./decleration";

export function getDeclerations(slectedText: string): Decleration[] {
  if (slectedText.length < 2) {
    vscode.window.showErrorMessage("select the properties first.");
    throw new Error("select the properties first.");
  }
  const declerations: Decleration[] = [];

  let classProperties = slectedText
    .split(/\r?\n/)
    .filter(x => x.length > 2)
    .map(x => x.replace(";", ""));

  for (let lineOfCode of classProperties) {
    let declaration = lineOfCode
      .split("=")[0]
      .replace("final ", " ")
      .replace("public ", " ")
      .replace("private ", " ")
      .trim()
      .split(" ");
    let variableType,
      variableName,
      variableNameFirstCapital: string = "";
    let skip = false;

    if (declaration[0].charAt(0) === "@" || declaration[0].charAt(0) === "/") {
      continue;
    }

    declaration.forEach(element => {
      if (element === "static") {
        vscode.window.showWarningMessage(
          declaration[declaration.length - 1] + " skiped as it's static"
        );
        skip = true;
      }
    });

    if (declaration.length === 1) {
      vscode.window.showWarningMessage(
        declaration.join(" ") + " skiped as it's unvalid"
      );
      continue;
    } else if (declaration.length === 2) {
      variableType = declaration[0];
      variableName = declaration[1];
      variableNameFirstCapital = capitalizeFirstLetter(declaration[1]);
    }

    if (!skip) {
      declerations.push(
        new Decleration(variableType, variableName, variableNameFirstCapital)
      );
    }
  }
  return declerations;
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function lowerCaseFirstLetter(string: string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

export async function getClassName(classFile: string): Promise<string> {
  let regex = /(class|interface|enum)\s([^\n\s]*)/g;
  //  console.log(classFile.match(regex));

  let items: vscode.QuickPickItem[] = [];

  let arrayOfClass = classFile.match(regex);
  if (!arrayOfClass || arrayOfClass.length < 1) {
    vscode.window.showErrorMessage(
      "couldn't parse the class name please file an issue"
    );
    return Promise.reject("couldn't parse the class name please file an issue");
  } else if (arrayOfClass.length === 1) {
    return arrayOfClass[0].split(" ")[1];
  } else {
    arrayOfClass!.forEach(match => {
      items.push({
        label: match.split(" ")[1],
        detail: match.split(" ")[0]
      });
    });
    let classDecleration = await vscode.window.showQuickPick(items, {
      canPickMany: false,
      placeHolder: "please pick..."
    });

    if (classDecleration) {
      return classDecleration.label;
    }
    {
      vscode.window.showErrorMessage(
        "couldn't parse the class name please file an issue"
      );
      return Promise.reject(
        "couldn't parse the class name please file an issue"
      );
    }
  }
}

export function insertSnippet(snippet: string) {
  let editor = vscode.window.activeTextEditor!;
  let newLines = editor.document.lineAt(editor.selection.active.line)
    .isEmptyOrWhitespace
    ? 0
    : 1;
  editor.insertSnippet(
    new vscode.SnippetString(snippet),
    new vscode.Position(editor.selection.end.line + newLines, 0)
  );
}

export function getSelectedText(): string {
  let editor = vscode.window.activeTextEditor!;
  if (editor) {
    let text = editor.document.getText(editor.selection);
    if (text.length < 2) {
      vscode.window.showErrorMessage("select the properties first.");
      throw new Error("select the properties first.");
    }
    return text;
  } else {
    vscode.window.showErrorMessage(
      "right click on the editor then run the command."
    );
    throw new Error("right click on the editor then run the command.");
  }
}
