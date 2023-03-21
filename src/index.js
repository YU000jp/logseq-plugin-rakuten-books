import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { logseq as PL } from "../package.json";
const pluginId = PL.id; //set plugin id from package.json


/* main */
const main = () => {
  console.info(`#${pluginId}: MAIN`); //console


  /* user setting */
  // https://logseq.github.io/plugins/types/SettingSchemaDesc.html
  const settingsTemplate = [
    {
      key: "advancedQuery",
      type: "string",
      inputAs: 'textarea',
      default: `
[:find (pull ?e [*]) 
:where
[?e :block/marker ?m]
[(contains? #{"DOING"} ?m)]]
`,
      title: "Customize advanced-query",
      description: ``,
    }
  ];
  logseq.useSettingsSchema(settingsTemplate);


  //test samples

  /* dialog sample */
  logseq.UI.showMsg(`add items at toolbar and contextmenu`);

  /* CSS sample */
  logseq.provideStyle(String.raw`
    div#test {
      font-size: 20px;
    }
  `);

  /* contextmenu-item(select a bullet) sample */
  logseq.Editor.registerBlockContextMenuItem('🟢Open at right sidebar', async ({ uuid }) => {
    logseq.App.openInRightSidebar(uuid);
    logseq.UI.showMsg("🟢Open at right sidebar");
    console.log(`#${pluginId}: 🟢Open at right sidebar`);
  });

  /* toolbar-item sample */
  //for open_toolbar
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `
    <div data-on-click="open_toolbar" style="font-size:20px">🔥</div>
    `,
  });

  //test samples end


  console.info(`#${pluginId}: loaded`);//console
};/* end_main */



/* on click open_toolbar */
const model = {
  async open_toolbar() {
    console.info(`#${pluginId}: open_toolbar`);//console


    //test message
    logseq.UI.showMsg(`Open toolbar`);

    //Advanced Query test sample
    const queryScript = logseq.settings.advancedQuery;//from user setting
    console.log(`#${pluginId}: queryScript ${queryScript}`);//console
    const queryResult = await logseq.DB.datascriptQuery(queryScript);
    console.log(`#${pluginId}: Advanced Query result`);//console
    console.log(queryResult); //console return object

    //test message
    logseq.UI.showMsg(`Open toolbar end`);


    console.log(`#${pluginId}: open_toolbar end`);//console
  }
};


logseq.ready(model, main).catch(console.error);