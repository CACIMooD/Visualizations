/**
 * @jest-environment jsdom
 */

import Tabulator from "tabulator-tables";
import { transformJson, createColumnDefinition } from "../../libraries/tableManger.js";
import { config } from "../test-data.js";
import { getFormat, formatDate } from "../../../formatters/TabulatorFormatters.js";
import { getEditorType } from "../../../formatters/TabulatorEditors.js";

describe("Initial Tabulator tests", () => {
  const data = [
    { id: 1, name: "Bristol", acronym: "DB", rating: "3" },
    { id: 2, name: "Spain", acronym: "DB", rating: "5" },
    { id: 3, name: "England", acronym: "DB", rating: "2" },
  ];

  beforeEach(() => {
    document.body.innerHTML = '<div id="initial-table"></div>';
  });

  it("should initialize a Tabulator table", () => {
    const table = new Tabulator("#initial-table", {
      data: [],
      columns: [
        { title: "Name", field: "name" },
        { title: "Acronym", field: "acronym" },
      ],
    });

    expect(table).toBeDefined();
    expect(document.querySelectorAll(".tabulator-cell").length).toBe(0);
  });

  it("should load data into the table", async () => {
    const table = new Tabulator("#initial-table", {
      data: [
        { name: "Bristol", acronym: "BRS" },
        { name: "England", acronym: "ENG" },
      ],
      columns: [
        { title: "Name", field: "name" },
        { title: "Acronym", field: "acronym" },
      ],
    });

    await new Promise((resolve) => {
      table.on("tableBuilt", resolve);
    });

    const rows = table.getRows();
    expect(rows.length).toBe(2);
  });

  it("should load Mood data into the table", async () => {
    const table = new Tabulator("#initial-table", {
      data: data,
      columns: [
        { title: "ID", field: "id"},
        { title: "Name", field: "name" },
        { title: "Acronym", field: "acronym" },
        { title: "Rating", field: "rating" },
      ],
    });

    await new Promise((resolve) => {
      table.on("tableBuilt", resolve);
    });

    const rows = table.getRows();
    expect(rows.length).toBe(3);
  });

  it("should delete a row", async () => {
    const table = new Tabulator("#initial-table", {
      data: data,
      columns: [
        { title: "ID", field: "id"},
        { title: "Name", field: "name" },
        { title: "Acronym", field: "acronym" },
        { title: "Rating", field: "rating" },
      ],
    });

    await new Promise((resolve) => {
      table.on("tableBuilt", resolve);
    });

    await table.deleteRow(1);

    const rows = table.getRows();
    expect(rows.length).toBe(2);
    expect(rows[0].getData().id).toBe(2);
  });
});

describe("Testing the Mood Tabulator source code", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="initial-table"></div>';
  });

  // The following 2 tests are on a function that longer exported
  // 
  // it("should initialize the Mood Table successfully", async () => {
  //   const table = new Tabulator("#initial-table", {
  //     data: transformJson(config.data.rows),
  //     columns: createColumnDefinition(config, config.data.rows),
  //   });

  //   await new Promise((resolve) => {
  //     table.on("tableBuilt", resolve);
  //   });

  //   expect(table).toBeDefined();
  // });

  // it("should load data into the Mood Table successfully", async () => {
  //   const table = new Tabulator("#initial-table", {
  //     data: transformJson(config.data.rows),
  //     columns: createColumnDefinition(config, config.data.rows),
  //   });

  //   await new Promise((resolve) => {
  //     table.on("tableBuilt", resolve);
  //   });

  //   const rows = table.getRows();
  //   expect(rows.length).toBe(7);
  // });

  // The following test fails in GitHub when on BST
  //
  // it("should provide a valid date with correct formatting", async () => {
  //   const cell = {
  //     getValue: function() {
  //       return "2024-07-22T12:07:32Z"
  //     }
  //   };

  //   const formattedDate = formatDate(cell, "%yyyy %MMM, %dd %ddd - %hh:%mm:%ss %tt")

  //   expect(formattedDate).toBe("2024 Jul, 22 Mon - 13:07:32 PM");
  // });

  it("should return empty string if formatDate executes with an invalid date", async () => {
    const cell = {
      getValue: function() {
        return "invalid"
      }
    };

    const formattedDate = formatDate(cell, "%yyyy %MMM, %dd %ddd")

    expect(formattedDate).toBe("");
  });

  it("should fetch the 'datetime' formatter", async () => {
    const format = getFormat["datetime"];

    expect(typeof format).toBe("function");
  });

  it("should fetch the 'time' formatter", async () => {
    const format = getFormat["time"];

    expect(typeof format).toBe("function");
  });

  it("should fetch the 'date' formatter", async () => {
    const format = getFormat["date"];

    expect(typeof format).toBe("function");
  });

  // The following test fails in GitHub when on BST
  //
  // it("should provide a formatted date from the 'datetime' formatter", async () => {
  //   const cell = {
  //     getValue: function() {
  //       return "2024-07-22T12:07:32Z"
  //     }
  //   };

  //   const format = getFormat["datetime"];

  //   const formattedDate = format(cell);

  //   expect(formattedDate).toBe("Mon Jul 22 2024, 13:07:32");
  // });

  it("should provide an empty string from the 'datetime' formatter if date is invalid", async () => {
    const cell = {
      getValue: function() {
        return ""
      }
    };

    const format = getFormat["datetime"];

    const formattedDate = format(cell);

    expect(formattedDate).toBe("");
  });

  // The following test fails in GitHub when on BST
  //
  // it("should provide a formatted data from the 'time' formatter", async () => {
  //   const cell = {
  //     getValue: function() {
  //       return "2024-07-22T12:07:32Z"
  //     }
  //   };

  //   const format = getFormat["time"];

  //   const formattedDate = format(cell);

  //   expect(formattedDate).toBe("13:07:32");
  // });

  it("should provide an empty string from the 'time' formatter if date is invalid", async () => {
    const cell = {
      getValue: function() {
        return ""
      }
    };

    const format = getFormat["time"];

    const formattedDate = format(cell);

    expect(formattedDate).toBe("");
  });

  // The following test fails in GitHub when on BST
  //
  // it("should provide a formatted data from the 'date' formatter", async () => {
  //   const cell = {
  //     getValue: function() {
  //       return "2024-07-22T12:07:32Z"
  //     }
  //   };

  //   const format = getFormat["date"];

  //   const formattedDate = format(cell);

  //   expect(formattedDate).toBe("22/07/2024");
  // });

  it("should provide an empty string from the 'date' formatter if date is invalid", async () => {
    const cell = {
      getValue: function() {
        return ""
      }
    };

    const format = getFormat["date"];

    const formattedDate = format(cell);

    expect(formattedDate).toBe("");
  });

  it("should return 'true' from the editor", () => {
    const editor = getEditorType("rownum");

    expect(editor).toBe("input");
  });

  it("should return 'date' from the editor if formatter includes '%'", () => {
    const editor = getEditorType("%yyyy-%MM-%dd");

    expect(editor).toBe("date");
  });

  it("should return 'date' from the editor if formatter is 'datetime'", () => {
    const editor = getEditorType("datetime");

    expect(editor).toBe("date");
  });

  it("should return nothing from the editor", () => {
    const editor = getEditorType("");

    expect(editor).toBe(undefined);
  });
});
