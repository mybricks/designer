import initBlocks from './blocks/initBlocks'
import BlocklyContext from "./BlocklyContext";

let wsCfg //Global
let wsCtx: BlocklyContext

export function initConfig(ctx: BlocklyContext) {
  // const fn = Blockly.hideChaff
  // Blockly.hideChaff = function () {
  //   fn(true)
  // }
  wsCtx = ctx
  const blockCatelogAry = initBlocks(wsCtx)

  //if (!wsCfg) {
    //Blockly.Msg.CONTROLS_IF_MSG_IF = '如果'
    Blockly.Flyout.prototype.autoClose = false

    // const theme = Blockly.Theme.defineTheme('ww', {///TODO ERROR
    //   "componentStyles": {
    //     "workspaceBackgroundColour": "#fff",
    //     "toolboxBackgroundColour": "#F3F3F3",
    //   },
    //   'categoryStyles': {
    //     "list_category": {
    //       "colour": "#ff0000"
    //     },
    //     "logic_category": {
    //       "colour": "#FF0000",
    //     }
    //   }
    // })

    overideBlockly()

    // setTimeout(v => {
    //   const workspace = Blockly.getMainWorkspace()
    //   const oriTree = workspace.options.languageTree
    //   updateToolbox(oriTree)
    // })

    const toolboxXml = getToolboxXml(blockCatelogAry)
    wsCfg = {
      //theme,
      toolbox: toolboxXml,
      autoClose: false,
      media: './',
      grid: {
        spacing: 15,
        length: 20,
        colour: '#F3F3F3',
        snap: true
      },
      zoom: {
        //controls: true,
        wheel: false,
        startScale: 0.70,
        maxScale: 3,
        minScale: 0.3,
        scaleSpeed: 1.2
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      collapse: true,
      comments: true,
      disable: true,
      maxBlocks: Infinity,
      trashcan: false,
      horizontalLayout: false,
      toolboxPosition: 'start',
      css: true,
      rtl: false,
      //scrollbars: true,
      sounds: false,
      renderer: 'zelos'
    }
  //}

  return wsCfg
}

function overideBlockly() {
  //Overide
  Blockly.FieldVariable.dropdownCreate = function () {
    if (!this.variable_) {
      throw Error('Tried to call dropdownCreate on a variable field with no' +
        ' variable selected.');
    }
    const name = this.getText();

    let variableModelList = [];
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
      const variableTypes = this.getVariableTypes_();
      // Get a copy of the list, so that adding rename and new variable options
      // doesn't modify the workspace's list.
      for (let i = 0; i < variableTypes.length; i++) {
        const variableType = variableTypes[i];
        const variables =
          this.sourceBlock_.workspace.getVariablesOfType(variableType);
        variableModelList = variableModelList.concat(variables);
      }
    }
    variableModelList.sort(Blockly.VariableModel.compareByName);

    const varAry = []

    variableModelList.forEach(vm=>{
      if(!varAry.find(tv=>tv.name===vm.name)){
        varAry.push(vm)
      }
    })

    const options = [];
    for (let i = 0; i < varAry.length; i++) {
      // Set the UUID as the internal representation of the variable.
      options[i] = [varAry[i].name, varAry[i].getId()];
    }

    const regx = new RegExp(`^${wsCtx.curFn.id}$`)

    if (!name.match(regx)) {
      options.push([Blockly.Msg['RENAME_VARIABLE'], Blockly.RENAME_VARIABLE_ID]);
      if (Blockly.Msg['DELETE_VARIABLE']) {
        options.push(
          [
            Blockly.Msg['DELETE_VARIABLE'].replace('%1', name),
            Blockly.DELETE_VARIABLE_ID
          ]
        )
      }
    }

    return options;
  }

  Blockly.JavaScript.init = function (workspace) {
    // Create a dictionary of definitions to be printed before the code.
    Blockly.JavaScript.definitions_ = Object.create(null);
    // Create a dictionary mapping desired function names in definitions_
    // to actual function names (to avoid collisions with user functions).
    Blockly.JavaScript.functionNames_ = Object.create(null);

    if (!Blockly.JavaScript.variableDB_) {
      Blockly.JavaScript.variableDB_ =
        new Blockly.Names(Blockly.JavaScript.RESERVED_WORDS_);
    } else {
      Blockly.JavaScript.variableDB_.reset();
    }

    Blockly.JavaScript.variableDB_.setVariableMap(workspace.getVariableMap());

    var defvars = [];
    // Add developer variables (not created or named by the user).
    var devVarList = Blockly.Variables.allDeveloperVariables(workspace);
    for (var i = 0; i < devVarList.length; i++) {
      defvars.push(Blockly.JavaScript.variableDB_.getName(devVarList[i],
        Blockly.Names.DEVELOPER_VARIABLE_TYPE));
    }

    const regx = new RegExp(`^${wsCtx.curFn.id}$`)

    // Add user variables, but only ones that are being used.
    var variables = Blockly.Variables.allUsedVarModels(workspace);
    for (var i = 0; i < variables.length; i++) {
      const varName = Blockly.JavaScript.variableDB_.getName(variables[i].getId(),
        Blockly.VARIABLE_CATEGORY_NAME)
      if (!varName.match(regx)) {
        defvars.push(varName)
      }
    }

    const curVarAry = wsCtx.getCurVars()
    if(curVarAry){
      curVarAry.forEach(({name})=>{
        if (!name.match(regx)) {
          defvars.push(name)
        }
      })
    }

    defvars = Array.from(new Set(defvars))

    // Declare all of the variables.
    if (defvars.length) {
      Blockly.JavaScript.definitions_['variables'] =
        'var ' + defvars.join(', ') + ';';
    }
  }

}

function updateToolbox(oriTree) {
  const workspace = Blockly.getMainWorkspace()

  let xmlList = [];
  const button = document.createElement('button');
  button.setAttribute('text', '%{BKY_NEW_VARIABLE}');
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');

  workspace.registerButtonCallback('CREATE_VARIABLE', function (button) {
    Blockly.Variables.createVariableButtonHandler(button.getTargetWorkspace());
    updateToolbox(oriTree)
  })

  xmlList.push(button);

  xmlList = xmlList.concat(getAllVars(workspace));

  const tree = oriTree.concat(Blockly.utils.toolbox.convertToolboxToJSON(xmlList))

  workspace.updateToolbox(tree);
}

function getAllVars(workspace) {
  const variableModelList = workspace.getVariablesOfType('');

  const xmlList = [];
  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];
    if (Blockly.Blocks['variables_set']) {
      const block = Blockly.utils.xml.createElement('block');
      block.setAttribute('type', 'variables_set');
      block.setAttribute('gap', 18);
      block.appendChild(
        Blockly.Variables.generateVariableFieldDom(mostRecentVariable));
      xmlList.push(block);
    }

    if (Blockly.Blocks['variables_get']) {
      variableModelList.sort(Blockly.VariableModel.compareByName);
      for (let i = 0, variable; (variable = variableModelList[i]); i++) {
        const block = Blockly.utils.xml.createElement('block');
        block.setAttribute('type', 'variables_get');
        block.setAttribute('gap', 18);
        block.appendChild(Blockly.Variables.generateVariableFieldDom(variable));
        xmlList.push(block);
      }
    }
  }
  return xmlList;
}

function getToolboxXml(blockCatelogAry) {
  return `
  <xml xmlns="https://developers.google.com/blockly/xml" style="display: block">
    ${blockCatelogAry.map(catelog => {
    let rtn = ''
    if (catelog.name) {
      rtn += `<label text="${catelog.name}"/>`
    }
    rtn += catelog.blockAry.map(({name, showInToolbox}) => {
      if (showInToolbox === void 0 || showInToolbox) {
        return `<block type="${name}"/>`
      }
      return ''
    })
    return rtn
  })}
  </xml>
  `
}