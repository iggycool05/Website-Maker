import { $ } from "../Utils/helpers.js";

export const elements = {
  htmlInput: $("htmlInput"),
  previewFrame: $("previewFrame"),

  // ── Workspace panels ──
  codePanel:    $("codePanel"),
  previewPanel: $("previewPanel"),

  // ── Tab buttons ──
  sourceCodeTabBtn: $("sourceCodeTabBtn"),

  addParagraphBtn: $("addParagraphBtn"),
  addLinkBtn:    $("addLinkBtn"),
  addButtonBtn:  $("addButtonBtn"),
  addInputBtn:   $("addInputBtn"),
  addVideoBtn:   $("addVideoBtn"),
  addSectionBtn: $("addSectionBtn"),
  addNavBtn:     $("addNavBtn"),
  addFooterBtn:  $("addFooterBtn"),
  addFormBtn:    $("addFormBtn"),
  addListBtn:    $("addListBtn"),
  addTableBtn:   $("addTableBtn"),

  //Elements for the HTML editor ribbon
  htmlEditorTabBtn: $("htmlEditorTabBtn"),
  htmlEditorRibbon: $("htmlEditorRibbon"),

  // ── JS Editor ribbon ──
  jsEditorTabBtn:       $("jsEditorTabBtn"),
  jsEditorRibbon:       $("jsEditorRibbon"),
  jsInsertFunctionBtn:  $("jsInsertFunctionBtn"),
  jsInsertArrowBtn:     $("jsInsertArrowBtn"),
  jsInsertLogBtn:       $("jsInsertLogBtn"),
  jsInsertTimeoutBtn:   $("jsInsertTimeoutBtn"),
  jsInsertIntervalBtn:  $("jsInsertIntervalBtn"),
  jsInsertQueryBtn:     $("jsInsertQueryBtn"),
  jsInsertEventBtn:     $("jsInsertEventBtn"),
  jsInsertClickBtn:     $("jsInsertClickBtn"),
  jsInsertClassToggle:  $("jsInsertClassToggle"),
  jsInsertFetchBtn:     $("jsInsertFetchBtn"),
  jsBindClickBtn:       $("jsBindClickBtn"),
  jsBindInputBtn:       $("jsBindInputBtn"),
  jsConsoleToggleBtn:   $("jsConsoleToggleBtn"),
  addHeadingBtn: $("addHeadingBtn"),
  // Heading dropdown elements
  headingDropdownBtn: $("headingDropdownBtn"),
  headingDropdownMenu: $("headingDropdownMenu"),

  addDivBtn: $("addDivBtn"),
  addSpanBtn: $("addSpanBtn"),
  // Elements for Image insertion
  addImageBtn: $("addImageBtn"),
  addImageInput: $("addImageInput"),
  // Elements for font size adjustment
  decreaseFontBtn: $("decreaseFontBtn"),
  increaseFontBtn: $("increaseFontBtn"),
  fontSizeNumber: $("fontSizeNumber"),
  // Element for font family selection
  fontFamilySelect: $("fontFamilySelect"),
  // Render button
  renderPreviewBtn: $("renderPreviewBtn"),

  // ── Right-click context menu ──
  elementContextMenu: $("elementContextMenu"),
  ctxTagLabel:        $("ctxTagLabel"),
  ctxIdBadge:         $("ctxIdBadge"),
  ctxSetId:           $("ctxSetId"),
  ctxAddComment:      $("ctxAddComment"),
  ctxAddCssClass:     $("ctxAddCssClass"),
  ctxClassPanel:      $("ctxClassPanel"),
  ctxClassSearch:     $("ctxClassSearch"),
  ctxClassList:       $("ctxClassList"),

  // ── Set ID modal ──
  setIdModal:       $("setIdModal"),
  setIdElementTag:  $("setIdElementTag"),
  setIdInput:       $("setIdInput"),
  setIdError:       $("setIdError"),
  setIdConfirm:     $("setIdConfirm"),
  setIdCancel:      $("setIdCancel"),

  // ── Add Comment modal ──
  addCommentModal:       $("addCommentModal"),
  addCommentElementTag:  $("addCommentElementTag"),
  addCommentInput:       $("addCommentInput"),
  addCommentConfirm:     $("addCommentConfirm"),
  addCommentCancel:      $("addCommentCancel"),

  // ── ID Picker (inside HTML Editor ribbon) ──
  idPicker:          $("idPicker"),
  idPickerInput:     $("idPickerInput"),
  idPickerArrow:     $("idPickerArrow"),
  idPickerDropdown:  $("idPickerDropdown"),
  idPickerSetBtn:    $("idPickerSetBtn"),
  idPickerRemoveBtn: $("idPickerRemoveBtn"),

  // ── Animation / Transition Builder ──
  animBuilderBtn: $("animBuilderBtn"),

  // ── CSS Editor ribbon ──
  cssEditorTabBtn:   $("cssEditorTabBtn"),
  cssEditorRibbon:   $("cssEditorRibbon"),
  buildCssClassBtn:  $("buildCssClassBtn"),
  cssClassPicker:    $("cssClassPicker"),
  cssClassInput:     $("cssClassInput"),
  cssClassArrow:     $("cssClassArrow"),
  cssClassDropdown:  $("cssClassDropdown"),
  cssClassApplyBtn:  $("cssClassApplyBtn"),
  cssClassEditBtn:   $("cssClassEditBtn"),
  cssClassDeleteBtn: $("cssClassDeleteBtn"),

  // ── Class Builder modal ──
  classBuilderModal:   $("classBuilderModal"),
  cbClassNameInput:    $("cbClassNameInput"),
  classBuilderError:   $("classBuilderError"),
  classBuilderConfirm: $("classBuilderConfirm"),
  classBuilderCancel:  $("classBuilderCancel"),

  // ── File Explorer (Source Code tab sidebar) ──
  fileExplorer:  $("fileExplorer"),
  feCssFile:     $("feCssFile"),
  feJsFileList:  $("feJsFileList"),
  editorArea:   $("editorArea"),
  cssInput:     $("cssInput"),
  jsInput:      $("jsInput"),

  // ── List Builder modal ──
  listBuilderModal:   $("listBuilderModal"),
  lbItemsInput:       $("lbItemsInput"),
  lbClassInput:       $("lbClassInput"),
  listBuilderCancel:  $("listBuilderCancel"),
  listBuilderConfirm: $("listBuilderConfirm"),

  // ── Table Builder modal ──
  tableBuilderModal:   $("tableBuilderModal"),
  tbRowsInput:         $("tbRowsInput"),
  tbColsInput:         $("tbColsInput"),
  tbHeaderCheck:       $("tbHeaderCheck"),
  tbClassInput:        $("tbClassInput"),
  tableBuilderCancel:  $("tableBuilderCancel"),
  tableBuilderConfirm: $("tableBuilderConfirm"),

  // ── DOM Inspector panel ──
  inspectorPanel:     $("inspectorPanel"),
  inspectorTree:      $("inspectorTree"),
  inspectorToggleBtn: $("inspectorToggleBtn"),
  inspectorCloseBtn:  $("inspectorCloseBtn"),

  // ── Properties Panel ──
  propertiesPanel:      $("propertiesPanel"),
  propertiesContent:    $("propertiesContent"),
  propertiesToggleBtn:  $("propertiesToggleBtn"),
  propertiesCloseBtn:   $("propertiesCloseBtn"),

  // ── Format Toolbar ──
  formatToolbar:    $("formatToolbar"),
  fmtBoldBtn:       $("fmtBoldBtn"),
  fmtItalicBtn:     $("fmtItalicBtn"),
  fmtUnderlineBtn:  $("fmtUnderlineBtn"),
  fmtStrikeBtn:     $("fmtStrikeBtn"),
  fmtClearBtn:      $("fmtClearBtn"),
  fmtColorInput:    $("fmtColorInput"),
  fmtColorBar:      $("fmtColorBar"),

  // ── Alignment buttons (HTML Editor ribbon) ──
  alignLeftBtn:    $("alignLeftBtn"),
  alignCenterHBtn: $("alignCenterHBtn"),
  alignRightBtn:   $("alignRightBtn"),
  alignTopBtn:     $("alignTopBtn"),
  alignCenterVBtn: $("alignCenterVBtn"),
  alignBottomBtn:  $("alignBottomBtn"),

  // ── Layer (z-index) control buttons ──
  layerFrontBtn:   $("layerFrontBtn"),
  layerForwardBtn: $("layerForwardBtn"),
  layerBackBtn:    $("layerBackBtn"),
  layerBottomBtn:  $("layerBottomBtn"),

  // ── Grid toggle ──
  gridToggleBtn: $("gridToggleBtn"),

  // ── Undo / Redo buttons ──
  undoBtn: $("undoBtn"),
  redoBtn: $("redoBtn"),

  // ── HTML ribbon scroll arrows ──
  htmlRibbonPrev: $("htmlRibbonPrev"),
  htmlRibbonNext: $("htmlRibbonNext"),

  // ── Context menu copy / paste / duplicate / delete ──
  ctxCopyBtn:      $("ctxCopyBtn"),
  ctxPasteBtn:     $("ctxPasteBtn"),
  ctxDuplicateBtn: $("ctxDuplicateBtn"),
  ctxDeleteBtn:    $("ctxDeleteBtn"),

  // ── Responsive preview device buttons (tab bar) ──
  devicePhoneBtn:   $("devicePhoneBtn"),
  deviceTabletBtn:  $("deviceTabletBtn"),
  deviceDesktopBtn: $("deviceDesktopBtn"),

  // ── JS Library + Selector Picker ──
  jsLibraryBtn:        $("jsLibraryBtn"),
  jsPickSelectorBtn:   $("jsPickSelectorBtn"),
  selectorPickerDropdown: $("selectorPickerDropdown"),

  // ── Template Gallery ──
  templateGalleryBtn: $("templateGalleryBtn"),

  // ── Widget Library ──
  widgetsTabBtn:  $("widgetsTabBtn"),
  widgetsRibbon:  $("widgetsRibbon"),
};