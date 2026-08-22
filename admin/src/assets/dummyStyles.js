// src/assets/dummyStyles.js
// Add these to your existing assets/dummyStyles.js

export const addMoviePageStyles = {
  // Layout and container styles
  pageContainer: "min-h-screen p-4 sm:p-6 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-100",
  mainContainer: "max-w-6xl mx-auto bg-gradient-to-r from-black via-red-900 to-black/80 border-2 border-red-700 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl",
  
  // Header
  header: "flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4",
  title: "text-2xl sm:text-3xl md:text-4xl font-bold",
  titleIcon: "inline-block mr-2 -translate-y-1",
  
  // Form
  form: "space-y-6",
  radioContainer: "flex flex-col sm:flex-row sm:flex-wrap gap-3 lg:gap-4",
  radioLabel: "flex items-center gap-2",
  radioInput: "accent-red-600",
  
  // Sections
  section: "bg-black/20 p-4 rounded-lg border border-red-700",
  sectionGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  sectionTitle: "font-semibold",
  
  // Input fields
  inputContainer: "",
  label: "block text-sm mb-2",
  input: "w-full rounded-lg p-3 bg-black/20 border border-red-600 placeholder-gray-400",
  textarea: "w-full rounded-lg p-3 bg-black/20 border border-red-600",
  numberInput: "w-32 rounded-lg p-2 bg-black/20 border border-red-600",
  select: "w-full rounded-lg p-2 bg-black/20 border border-red-600",
  
  // Category buttons
  categoryContainer: "flex gap-3 flex-wrap",
  categoryButton: "px-3 py-1 rounded-full border",
  categoryButtonSelected: "bg-red-700 text-white border-red-700",
  categoryButtonNormal: "bg-black/20 border-gray-700",
  
  // File upload areas
  uploadContainer: "border-2 border-dashed border-red-700 rounded-lg p-3 bg-black/30",
  uploadContent: "flex flex-col items-center justify-center gap-2 cursor-pointer",
  uploadIconContainer: "p-4 rounded-md bg-black/40 border border-red-700",
  uploadIcon: "size-36",
  uploadText: "text-xs opacity-80",
  uploadInput: "hidden",
  
  // Preview images
  previewContainer: "relative",
  previewImage: "w-full h-48 object-contain rounded-md",
  previewThumbnail: "w-full h-40 sm:h-48 object-contain rounded-md",
  removeButton: "absolute -top-2 right-2 bg-red-700/90 p-1 rounded-full",
  removeIcon: "size-6",
  
  // Grid layouts
  gridCols1: "grid grid-cols-1 gap-4",
  gridCols2: "grid grid-cols-1 sm:grid-cols-2 gap-4",
  gridCols3: "grid grid-cols-1 sm:grid-cols-3 gap-4",
  gridCols2Md3: "sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4",
  
  // Duration controls
  durationContainer: "flex gap-3 flex-wrap",
  durationInput: "w-32 rounded-lg p-2 bg-black/20 border border-red-600",
  
  // Slots section
  slotsHeader: "flex items-center justify-between mb-3",
  addSlotButton: "flex items-center gap-2 px-3 py-1 rounded-full bg-red-700 text-sm",
  addSlotIcon: "",
  slotItem: "flex gap-3 items-center flex-col sm:flex-row",
  slotGrid: "flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full",
  slotInput: "p-2 rounded-lg bg-black/20 border border-gray-700 w-full",
  slotRemoveButton: "p-2 rounded-full bg-red-700",
  
  // Uploader components
  uploaderContainer: "p-3 bg-black/20 rounded-lg border border-red-700",
  uploaderHeader: "flex items-center justify-between mb-2",
  uploaderTitle: "flex items-center gap-2",
  uploaderTitleText: "font-semibold",
  uploaderAddButton: "text-xs px-3 py-1 bg-red-700 rounded-full cursor-pointer",
  uploaderAddInput: "hidden",
  uploaderGrid: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2",
  uploaderEmpty: "col-span-1 sm:col-span-2 md:col-span-3 text-sm opacity-80",
  
  // Uploader items
  uploaderItem: "relative bg-black/30 p-2 rounded-md",
  uploaderItemImage: "w-full h-36 sm:h-40 md:h-28 object-contain rounded-md",
  uploaderItemRemove: "absolute -top-1 -right-2 bg-red-700 p-1 rounded-full",
  uploaderItemRemoveIcon: "size-6",
  uploaderItemInput: "w-full rounded-md p-1 text-sm bg-black/10 border border-gray-700",
  
  // Named uploader
  namedUploaderGrid: "grid grid-cols-1 gap-3",
  namedUploaderItem: "relative flex gap-2 items-center bg-black/30 p-2 rounded-md",
  namedUploaderImage: "w-20 h-20 object-cover rounded-md",
  namedUploaderInput: "w-full rounded-lg p-2 bg-black/20 border border-gray-700 mb-2",
  namedUploaderFileName: "text-xs opacity-80",
  
  // Form actions
  actionsContainer: "flex gap-3 justify-end flex-col sm:flex-row",
  resetButton: "px-4 py-2 rounded-lg border border-red-700 w-full sm:w-auto",
  submitButton: "px-6 py-2 rounded-lg bg-red-700 font-semibold w-full sm:w-auto",
  
  // Icon sizes
  iconSm: "size-16",
  iconMd: "size-14",
  iconLg: "size-36"
};

// Custom styles for AddMoviePage
export const addMoviePageCustomStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Dancing+Script&display=swap');
  
  .font-cinzel {
    font-family: 'Cinzel', serif;
  }
`;
// src/assets/dummyStyles.js

export const styles2 = {
  // Layout styles
  pageContainer: "min-h-screen bg-black text-gray-100 p-6 sm:p-10",
  maxWidthContainer: "max-w-6xl mx-auto",
  
  // Header styles
  headerContainer: "mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4",
  formContainer: "flex items-center gap-3 w-full lg:w-auto",
  
  // Form elements
  select: "px-3 py-2 rounded-lg bg-gray-900 border border-red-800 text-sm outline-none focus:ring-2 focus:ring-red-600",
  clearButton: "px-3 py-2 rounded-lg bg-red-700 text-white text-sm hover:brightness-95",
  
  // Grid and cards
  gridContainer: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  messageContainer: "col-span-full text-center text-gray-400 py-8 border border-red-800 rounded-lg",
  bookingCard: "bg-gradient-to-r from-gray-900 to-black border border-red-800 rounded-xl p-4 shadow-lg flex flex-col justify-between",
  
  // Card content
  movieIconContainer: "w-12 h-12 rounded-md bg-red-800 flex items-center justify-center text-white",
  movieTitle: "text-lg font-bold text-red-300",
  bookingId: "text-xs text-gray-400",
  bookingIdValue: "font-mono ml-1 text-xs text-gray-200",
  bookedByLabel: "text-xs text-gray-400 mt-1",
  bookedByValue: "text-sm font-semibold text-gray-200",
  seatsLabel: "text-xs text-gray-400",
  seatsValue: "font-semibold text-gray-200",
  
  // Details section
  detailContainer: "mt-3 text-sm text-gray-300 space-y-2",
  detailItem: "flex items-center gap-2",
  detailIcon: "w-4 h-4 text-red-400",
  auditoriumLabel: "text-xs text-gray-400 mr-2",
  auditoriumValue: "font-semibold text-gray-200",
  
  // Amount section
  amountLabel: "text-xs text-gray-400",
  amountValue: "text-lg font-bold text-red-300"
};

// Font family style object
export const fontStyles = {
  cinzelFont: { fontFamily: "'Cinzel', serif" }
};

// src/assets/dummyStyles.js

export const styles3 = {
  // Layout styles
  pageContainer: "min-h-screen bg-black text-gray-100 p-6 sm:p-10",
  dashboardPageContainer: "min-h-screen bg-black text-gray-100 p-4 sm:p-6 lg:p-8",
  maxWidthContainer: "max-w-6xl mx-auto",
  
  // Header styles
  headerContainer: "mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4",
  dashboardHeaderContainer: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
  dashboardTitle: "text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-500",
  dashboardSubtitle: "text-sm text-gray-400 mt-1",
  formContainer: "flex items-center gap-3 w-full lg:w-auto",
  
  // Form elements
  select: "px-3 py-2 rounded-lg bg-gray-900 border border-red-800 text-sm outline-none focus:ring-2 focus:ring-red-600",
  clearButton: "px-3 py-2 rounded-lg bg-red-700 text-white text-sm hover:brightness-95",
  
  // Summary cards
  summaryGrid: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8",
  summaryCard: "rounded-2xl border border-red-800 bg-gradient-to-b from-gray-900/60 to-black p-4 shadow-lg",
  summaryCardInner: "flex items-center justify-between",
  summaryLabel: "text-xs text-gray-400",
  summaryValue: "text-2xl sm:text-3xl font-bold text-red-400",
  summaryBadge: "px-3 py-2 rounded-lg bg-red-800/20 text-red-300 text-sm font-medium",
  summaryNote: "mt-3 text-xs text-gray-500",
  
  // Movies section
  moviesSection: "rounded-2xl border border-red-800 bg-gradient-to-b from-gray-900 to-black p-4 shadow-inner",
  moviesHeader: "flex items-center justify-between mb-4",
  moviesTitle: "text-lg font-semibold text-red-400",
  moviesCount: "text-sm text-gray-400",
  
  // Table styles
  tableContainer: "hidden lg:block overflow-x-auto",
  table: "w-full table-auto",
  tableHeader: "text-xs text-gray-400 text-left border-b border-red-900/30",
  tableHeaderCell: "py-2 px-3",
  tableRow: "border-b border-red-900/20 hover:bg-white/2 transition-colors",
  tableMovieTitle: "font-semibold text-white",
  tableCell: "py-3 px-3 text-sm text-gray-200",
  tableEarnings: "py-3 px-3 text-sm text-red-300 font-semibold",
  tableAvg: "py-3 px-3 text-sm text-gray-300",
  tableEmpty: "py-6 text-center text-gray-500",
  
  // Mobile cards
  mobileList: "lg:hidden space-y-3",
  mobileCard: "bg-gradient-to-b from-gray-900/70 to-black border border-red-800 rounded-xl p-4 shadow-sm",
  mobileCardInner: "flex items-start justify-between gap-3",
  mobileMovieTitle: "font-semibold text-white text-base",
  mobileLabel: "text-xs text-gray-400 mt-1",
  mobileValue: "text-gray-200 font-medium",
  mobileEarnings: "text-sm text-red-300 font-semibold",
  mobileAvgLabel: "text-xs text-gray-400 mt-1",
  mobileAvgValue: "text-gray-300",
  mobileEmpty: "text-center py-6 text-gray-500",
  
  // Grid and cards
  gridContainer: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  messageContainer: "col-span-full text-center text-gray-400 py-8 border border-red-800 rounded-lg",
  bookingCard: "bg-gradient-to-r from-gray-900 to-black border border-red-800 rounded-xl p-4 shadow-lg flex flex-col justify-between",
  
  // Card content
  movieIconContainer: "w-12 h-12 rounded-md bg-red-800 flex items-center justify-center text-white",
  movieTitle: "text-lg font-bold text-red-300",
  bookingId: "text-xs text-gray-400",
  bookingIdValue: "font-mono ml-1 text-xs text-gray-200",
  bookedByLabel: "text-xs text-gray-400 mt-1",
  bookedByValue: "text-sm font-semibold text-gray-200",
  seatsLabel: "text-xs text-gray-400",
  seatsValue: "font-semibold text-gray-200",
  
  // Details section
  detailContainer: "mt-3 text-sm text-gray-300 space-y-2",
  detailItem: "flex items-center gap-2",
  detailIcon: "w-4 h-4 text-red-400",
  auditoriumLabel: "text-xs text-gray-400 mr-2",
  auditoriumValue: "font-semibold text-gray-200",
  
  // Amount section
  amountLabel: "text-xs text-gray-400",
  amountValue: "text-lg font-bold text-red-300"
};

// Font family style object
export const fontStyles2 = {
  cinzelFont: { fontFamily: "'Cinzel', serif" }
};

// src/assets/dummyStyles.js

export const styles4 = {
  // Layout styles
  pageContainer: "min-h-screen bg-black text-gray-100 p-6 sm:p-10",
  dashboardPageContainer: "min-h-screen bg-black text-gray-100 p-4 sm:p-6 lg:p-8",
  maxWidthContainer: "max-w-6xl mx-auto",
  
  // Navbar styles
  navbar: "bg-black border-b-2 border-red-600 shadow-2xl relative z-40",
  navbarContainer: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  navbarFlex: "flex items-center justify-between h-16",
  logoContainer: "flex items-center space-x-3",
  logoIcon: "flex items-center justify-center w-10 h-10 bg-red-600 rounded-full transform rotate-12 hover:rotate-0 transition-transform duration-300",
  logoIconInner: "w-6 h-6 text-white transform -rotate-12",
  logoText: "font-['Impact'] text-2xl text-white tracking-wider bg-gradient-to-r from-red-600 to-red-400 bg-clip-text",
  desktopNav: "hidden lg:flex lg:space-x-4",
  mobileMenuButton: "inline-flex items-center justify-center p-2 rounded-md text-red-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600",
  mobileMenuIcon: "w-6 h-6",
  
  // Navigation links
  navLinkBase: "group flex items-center space-x-2 px-4 py-2 rounded-full border border-red-800 transition-all duration-300 transform",
  navLinkActive: "bg-red-700 hover:from-red-800 scale-105 shadow-lg shadow-red-900/50",
  navLinkInactive: "bg-gradient-to-r from-red-900 to-black hover:from-red-800 hover:to-black",
  navLinkIconBase: "w-5 h-5 transition-colors",
  navLinkIconActive: "text-white",
  navLinkIconInactive: "text-red-400 group-hover:text-red-300",
  navLinkTextBase: "font-['Arial_Black'] text-sm tracking-wide transition-colors",
  navLinkTextActive: "text-white",
  navLinkTextInactive: "text-white group-hover:text-red-200",
  
  // Mobile menu
  mobileMenuContainer: "fixed inset-0 z-50 transition-all duration-300",
  mobileMenuBackdrop: "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
  mobileMenuPanel: "fixed top-0 right-0 h-full w-72 max-w-full bg-gradient-to-b from-black/95 to-black/90 border-l border-red-800 shadow-2xl transform transition-transform duration-300 lg:hidden",
  mobileMenuPanelHeader: "flex items-center justify-between px-4 py-4 border-b border-red-800",
  mobileMenuPanelNav: "px-4 py-6 space-y-3",
  mobileMenuPanelFooter: "absolute bottom-0 left-0 right-0 p-4 border-t border-red-800",
  mobileMenuFooterText: "text-xs text-red-300",
  
  // Mobile navigation links
  mobileNavLinkBase: "flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors",
  mobileNavLinkActive: "bg-red-700 text-white shadow-md",
  mobileNavLinkInactive: "hover:bg-white/5 text-red-200",
  mobileNavLinkIconBase: "w-5 h-5",
  mobileNavLinkIconActive: "text-white",
  mobileNavLinkIconInactive: "text-red-300",
  mobileNavLinkText: "font-semibold",
  
  // Header styles
  headerContainer: "mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4",
  dashboardHeaderContainer: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
  dashboardTitle: "text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-500",
  dashboardSubtitle: "text-sm text-gray-400 mt-1",
  formContainer: "flex items-center gap-3 w-full lg:w-auto",
  
  // Form elements
  select: "px-3 py-2 rounded-lg bg-gray-900 border border-red-800 text-sm outline-none focus:ring-2 focus:ring-red-600",
  clearButton: "px-3 py-2 rounded-lg bg-red-700 text-white text-sm hover:brightness-95",
  
  // Summary cards
  summaryGrid: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8",
  summaryCard: "rounded-2xl border border-red-800 bg-gradient-to-b from-gray-900/60 to-black p-4 shadow-lg",
  summaryCardInner: "flex items-center justify-between",
  summaryLabel: "text-xs text-gray-400",
  summaryValue: "text-2xl sm:text-3xl font-bold text-red-400",
  summaryBadge: "px-3 py-2 rounded-lg bg-red-800/20 text-red-300 text-sm font-medium",
  summaryNote: "mt-3 text-xs text-gray-500",
  
  // Movies section
  moviesSection: "rounded-2xl border border-red-800 bg-gradient-to-b from-gray-900 to-black p-4 shadow-inner",
  moviesHeader: "flex items-center justify-between mb-4",
  moviesTitle: "text-lg font-semibold text-red-400",
  moviesCount: "text-sm text-gray-400",
  
  // Table styles
  tableContainer: "hidden lg:block overflow-x-auto",
  table: "w-full table-auto",
  tableHeader: "text-xs text-gray-400 text-left border-b border-red-900/30",
  tableHeaderCell: "py-2 px-3",
  tableRow: "border-b border-red-900/20 hover:bg-white/2 transition-colors",
  tableMovieTitle: "font-semibold text-white",
  tableCell: "py-3 px-3 text-sm text-gray-200",
  tableEarnings: "py-3 px-3 text-sm text-red-300 font-semibold",
  tableAvg: "py-3 px-3 text-sm text-gray-300",
  tableEmpty: "py-6 text-center text-gray-500",
  
  // Mobile cards
  mobileList: "lg:hidden space-y-3",
  mobileCard: "bg-gradient-to-b from-gray-900/70 to-black border border-red-800 rounded-xl p-4 shadow-sm",
  mobileCardInner: "flex items-start justify-between gap-3",
  mobileMovieTitle: "font-semibold text-white text-base",
  mobileLabel: "text-xs text-gray-400 mt-1",
  mobileValue: "text-gray-200 font-medium",
  mobileEarnings: "text-sm text-red-300 font-semibold",
  mobileAvgLabel: "text-xs text-gray-400 mt-1",
  mobileAvgValue: "text-gray-300",
  mobileEmpty: "text-center py-6 text-gray-500",
  
  // Grid and cards
  gridContainer: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  messageContainer: "col-span-full text-center text-gray-400 py-8 border border-red-800 rounded-lg",
  bookingCard: "bg-gradient-to-r from-gray-900 to-black border border-red-800 rounded-xl p-4 shadow-lg flex flex-col justify-between",
  
  // Card content
  movieIconContainer: "w-12 h-12 rounded-md bg-red-800 flex items-center justify-center text-white",
  movieTitle: "text-lg font-bold text-red-300",
  bookingId: "text-xs text-gray-400",
  bookingIdValue: "font-mono ml-1 text-xs text-gray-200",
  bookedByLabel: "text-xs text-gray-400 mt-1",
  bookedByValue: "text-sm font-semibold text-gray-200",
  seatsLabel: "text-xs text-gray-400",
  seatsValue: "font-semibold text-gray-200",
  
  // Details section
  detailContainer: "mt-3 text-sm text-gray-300 space-y-2",
  detailItem: "flex items-center gap-2",
  detailIcon: "w-4 h-4 text-red-400",
  auditoriumLabel: "text-xs text-gray-400 mr-2",
  auditoriumValue: "font-semibold text-gray-200",
  
  // Amount section
  amountLabel: "text-xs text-gray-400",
  amountValue: "text-lg font-bold text-red-300"
};


// src/assets/dummyStyles.js

export const styles5 = {
  // Layout styles
  pageContainer: "min-h-screen bg-black text-gray-100 p-6 sm:p-10",
  dashboardPageContainer: "min-h-screen bg-black text-gray-100 p-4 sm:p-6 lg:p-8",
  listMoviesContainer: "min-h-screen p-4 sm:p-6 md:p-6 lg:p-6 bg-gradient-to-br from-gray-900 via-black to-gray-800 text-gray-100",
  maxWidthContainer: "max-w-6xl mx-auto",
  maxWidth7xl: "max-w-7xl mx-auto",
  
  // Navbar styles
  navbar: "bg-black border-b-2 border-red-600 shadow-2xl relative z-40",
  navbarContainer: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  navbarFlex: "flex items-center justify-between h-16",
  logoContainer: "flex items-center space-x-3",
  logoIcon: "flex items-center justify-center w-10 h-10 bg-red-600 rounded-full transform rotate-12 hover:rotate-0 transition-transform duration-300",
  logoIconInner: "w-6 h-6 text-white transform -rotate-12",
  logoText: "font-['Impact'] text-2xl text-white tracking-wider bg-gradient-to-r from-red-600 to-red-400 bg-clip-text",
  desktopNav: "hidden lg:flex lg:space-x-4",
  mobileMenuButton: "inline-flex items-center justify-center p-2 rounded-md text-red-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600",
  mobileMenuIcon: "w-6 h-6",
  
  // List Movies Header
  listMoviesHeader: "mb-10",
  listMoviesHeaderInner: "flex flex-col lg:flex-row items-center justify-between gap-6 mb-6",
  listMoviesTitle: "text-2xl lg:text-3xl font-bold",
  listMoviesSubtitle: "text-sm text-gray-400 mt-1",
  searchContainer: "w-full flex items-center justify-center lg:justify-end mt-4 lg:mt-0",
  searchBox: "relative w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-[540px] mx-auto lg:mx-0",
  searchInput: "w-full px-12 py-3 rounded-2xl text-sm sm:text-base md:text-lg bg-gray-800/50 border border-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm",
  searchIcon: "absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400",
  
  // Filter Tabs
  filterContainer: "flex flex-wrap gap-3 justify-center md:justify-start",
  filterButton: "filter-btn flex items-center gap-2 px-4 py-2 sm:py-3 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer",
  filterButtonActive: "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25",
  filterButtonInactive: "gradient-border text-gray-300 hover:bg-red-900/20 hover:text-white hover:border-red-500/40",
  
  // Main Grid
  mainGrid: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8",
  leftColumn: "md:col-span-2 lg:col-span-2",
  rightColumn: "md:col-span-1 lg:col-span-2",
  cardsGrid: "grid grid-cols-1 sm:grid-cols-2 gap-6",
  
  // Error and Loading States
  errorContainer: "col-span-full p-6 text-center text-red-300 rounded-2xl gradient-border",
  errorMessage: "font-semibold",
  errorRetryButton: "px-4 py-2 bg-red-700 rounded-lg",
  emptyState: "col-span-full p-8 text-center gradient-border rounded-2xl",
  emptyStateText: "text-gray-400 text-lg",
  emptyStateSubtext: "text-gray-500 text-sm mt-2",
  loadingState: "col-span-full p-6 text-center gradient-border rounded-2xl",
  loadingText: "text-gray-400",
  
  // Card Styles
  card: "card-hover bg-gray-800/40 rounded-2xl overflow-hidden gradient-border cursor-pointer group relative",
  cardDeleteButton: "absolute top-3 right-3 z-10 p-2 cursor-pointer rounded-full bg-red-700/90 hover:bg-red-800 text-white transition-colors",
  cardImage: "w-full h-44 sm:h-52 md:h-48 lg:h-52 object-contain transition-transform duration-500",
  cardContent: "p-4 sm:p-5",
  cardHeader: "flex items-start justify-between mb-3",
  cardTitle: "font-bold text-lg text-white truncate group-hover:text-red-300 transition-colors mb-1",
  cardCategories: "flex flex-wrap gap-1.5",
  cardCategory: "px-2 py-0.5 bg-gray-700/50 rounded-lg text-xs text-gray-300 border border-gray-600",
  cardRatingContainer: "flex flex-col items-end gap-2 ml-3",
  cardRating: "flex items-center gap-1.5 bg-yellow-500/20 px-3 py-1 rounded-full text-sm",
  cardRatingIcon: "text-yellow-400",
  cardRatingText: "text-yellow-400 text-sm font-bold",
  cardDuration: "flex items-center gap-1.5 bg-blue-500/20 px-3 py-1 rounded-full text-sm",
  cardDurationIcon: "text-blue-400",
  cardDurationText: "text-blue-400 text-sm",
  cardDescription: "text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 min-h-[56px]",
  cardActions: "flex items-center justify-between",
  cardViewButton: "flex items-center gap-2 px-4 md:px-2 md:text-xs py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white text-sm font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/25 cursor-pointer",
  cardTrailerButton: "flex items-center gap-2 px-3 py-2 gradient-border rounded-xl text-gray-300 text-sm hover:text-white hover:border-red-500/60 transition-all duration-300 cursor-pointer",
  cardTrailerIcon: "w-4 h-4 text-red-500",
  
  // Detail View Sidebar
  detailSidebar: "md:sticky md:top-6 lg:top-6 gradient-border rounded-2xl p-5 md:p-6 backdrop-blur-sm max-h-[auto] md:max-h-[75vh] lg:h-[85vh] overflow-y-auto",
  detailHeader: "flex items-center justify-between mb-4",
  detailTitle: "text-lg md:text-xl font-bold text-white",
  detailLiveIndicator: "flex items-center gap-2",
  detailLiveDot: "w-2 h-2 bg-red-500 rounded-full animate-pulse",
  detailLiveText: "text-xs text-gray-400",
  detailEmptyState: "flex flex-col items-center justify-center text-center py-12 md:py-16",
  detailEmptyIcon: "p-6 bg-gray-900/30 rounded-3xl border border-gray-700 backdrop-blur-sm",
  detailEmptyText: "text-gray-400 text-base mb-2",
  detailEmptySubtext: "text-gray-500 text-sm",
  
  // Detail View Content
  detailContainer: "space-y-6",
  detailHeaderContainer: "flex justify-between items-start gap-4 mb-2",
  detailTypeIndicator: "flex items-center gap-3 mb-3",
  detailTypeDot: "w-4 h-4 rounded-full bg-gradient-to-r",
  detailTypeText: "text-sm font-semibold text-gray-400 uppercase tracking-wide",
  detailContentTitle: "text-xl md:text-2xl font-bold text-white leading-tight",
  detailCloseButton: "flex-shrink-0 p-2.5 gradient-border rounded-xl text-gray-400 hover:text-white hover:border-red-500/60 transition-all duration-300 cursor-pointer",
  
  // Detail Sections
  detailThumbnail: "rounded-2xl overflow-hidden gradient-border",
  detailThumbnailImage: "w-full h-56 object-contain",
  detailGrid: "grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 gradient-border rounded-2xl",
  detailGridItem: "space-y-2",
  detailGridLabel: "text-gray-400 text-sm uppercase font-semibold",
  detailGridValue: "text-white font-medium",
  detailRatingValue: "flex items-center gap-2 text-yellow-400 font-bold",
  detailDescription: "space-y-3",
  descriptionLabel: "text-gray-400 text-sm uppercase font-semibold",
  descriptionText: "text-gray-300 leading-relaxed text-base",
  watchTrailerButton: "flex items-center justify-center gap-3 w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-2xl text-white font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] shadow-lg",
  
  // Movie Details
  detailPoster: "w-full h-72 object-contain",
  detailInfoGrid: "grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 sm:p-5 gradient-border rounded-2xl",
  detailInfoItem: "space-y-1",
  detailInfoLabel: "text-gray-400 text-sm uppercase font-semibold",
  detailInfoValue: "text-white font-medium text-lg",
  seatPrice: "text-green-400 font-bold text-lg",
  storySection: "space-y-3",
  storyLabel: "flex items-center gap-3",
  storyDot: "w-1.5 h-6 bg-red-500 rounded-full",
  storyText: "text-gray-300 leading-relaxed text-base",
  
  // Showtimes
  showtimesSection: "space-y-4",
  showtimesHeader: "flex items-center gap-3",
  showtimesIcon: "text-red-400",
  showtimesList: "space-y-3",
  showtimeItem: "flex items-center justify-between p-4 gradient-border rounded-2xl hover:border-red-500/60 transition-all duration-300 cursor-pointer",
  showtimeText: "text-white font-medium",
  showtimeStatus: "flex items-center gap-2",
  showtimeDot: "w-2 h-2 bg-green-500 rounded-full animate-pulse",
  showtimeStatusText: "text-green-400 text-xs font-semibold",
  
  // Release Soon
  releaseSoonContainer: "text-center space-y-6 py-8",
  releaseSoonImage: "rounded-2xl overflow-hidden gradient-border mx-auto max-w-sm transform transition-transform duration-500",
  releaseSoonText: "text-gray-400 text-lg font-semibold",
  releaseSoonCategories: "flex justify-center gap-3",
  releaseSoonCategory: "px-4 py-2 bg-gray-700/50 rounded-full text-sm text-gray-300 border border-gray-600 font-medium",
  releaseSoonMessage: "text-gray-500 text-sm mt-4",
  
  // Person Grid
  personGrid: "mt-6",
  personHeader: "flex items-center gap-3 mb-4",
  personDot: "w-1.5 h-6 bg-red-500 rounded-full",
  personTitle: "font-bold text-white text-lg",
  personList: "flex gap-4 overflow-x-auto pb-4 scrollbar-thin",
  personItem: "flex-shrink-0 text-center group cursor-pointer",
  personAvatar: "w-20 h-20 object-cover rounded-2xl mb-3 mx-auto border-2 border-gray-600 group-hover:border-red-500 transition-all duration-300 group-hover:scale-105",
  personName: "font-semibold text-sm text-white truncate max-w-[100px] mx-auto",
  personRole: "text-gray-400 text-xs mt-1 px-2 py-1 bg-gray-700/50 rounded-full",
  
  // Navigation links
  navLinkBase: "group flex items-center space-x-2 px-4 py-2 rounded-full border border-red-800 transition-all duration-300 transform",
  navLinkActive: "bg-red-700 hover:from-red-800 scale-105 shadow-lg shadow-red-900/50",
  navLinkInactive: "bg-gradient-to-r from-red-900 to-black hover:from-red-800 hover:to-black",
  navLinkIconBase: "w-5 h-5 transition-colors",
  navLinkIconActive: "text-white",
  navLinkIconInactive: "text-red-400 group-hover:text-red-300",
  navLinkTextBase: "font-['Arial_Black'] text-sm tracking-wide transition-colors",
  navLinkTextActive: "text-white",
  navLinkTextInactive: "text-white group-hover:text-red-200",
  
  // Mobile menu
  mobileMenuContainer: "fixed inset-0 z-50 transition-all duration-300",
  mobileMenuBackdrop: "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
  mobileMenuPanel: "fixed top-0 right-0 h-full w-72 max-w-full bg-gradient-to-b from-black/95 to-black/90 border-l border-red-800 shadow-2xl transform transition-transform duration-300 lg:hidden",
  mobileMenuPanelHeader: "flex items-center justify-between px-4 py-4 border-b border-red-800",
  mobileMenuPanelNav: "px-4 py-6 space-y-3",
  mobileMenuPanelFooter: "absolute bottom-0 left-0 right-0 p-4 border-t border-red-800",
  mobileMenuFooterText: "text-xs text-red-300",
  
  // Mobile navigation links
  mobileNavLinkBase: "flex items-center space-x-3 w-full px-4 py-3 rounded-lg transition-colors",
  mobileNavLinkActive: "bg-red-700 text-white shadow-md",
  mobileNavLinkInactive: "hover:bg-white/5 text-red-200",
  mobileNavLinkIconBase: "w-5 h-5",
  mobileNavLinkIconActive: "text-white",
  mobileNavLinkIconInactive: "text-red-300",
  mobileNavLinkText: "font-semibold",
  
  // Header styles
  headerContainer: "mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4",
  dashboardHeaderContainer: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6",
  dashboardTitle: "text-2xl sm:text-3xl md:text-4xl font-extrabold text-red-500",
  dashboardSubtitle: "text-sm text-gray-400 mt-1",
  formContainer: "flex items-center gap-3 w-full lg:w-auto",
  
  // Form elements
  select: "px-3 py-2 rounded-lg bg-gray-900 border border-red-800 text-sm outline-none focus:ring-2 focus:ring-red-600",
  clearButton: "px-3 py-2 rounded-lg bg-red-700 text-white text-sm hover:brightness-95",
  
  // Summary cards
  summaryGrid: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8",
  summaryCard: "rounded-2xl border border-red-800 bg-gradient-to-b from-gray-900/60 to-black p-4 shadow-lg",
  summaryCardInner: "flex items-center justify-between",
  summaryLabel: "text-xs text-gray-400",
  summaryValue: "text-2xl sm:text-3xl font-bold text-red-400",
  summaryBadge: "px-3 py-2 rounded-lg bg-red-800/20 text-red-300 text-sm font-medium",
  summaryNote: "mt-3 text-xs text-gray-500",
  
  // Movies section
  moviesSection: "rounded-2xl border border-red-800 bg-gradient-to-b from-gray-900 to-black p-4 shadow-inner",
  moviesHeader: "flex items-center justify-between mb-4",
  moviesTitle: "text-lg font-semibold text-red-400",
  moviesCount: "text-sm text-gray-400",
  
  // Table styles
  tableContainer: "hidden lg:block overflow-x-auto",
  table: "w-full table-auto",
  tableHeader: "text-xs text-gray-400 text-left border-b border-red-900/30",
  tableHeaderCell: "py-2 px-3",
  tableRow: "border-b border-red-900/20 hover:bg-white/2 transition-colors",
  tableMovieTitle: "font-semibold text-white",
  tableCell: "py-3 px-3 text-sm text-gray-200",
  tableEarnings: "py-3 px-3 text-sm text-red-300 font-semibold",
  tableAvg: "py-3 px-3 text-sm text-gray-300",
  tableEmpty: "py-6 text-center text-gray-500",
  
  // Mobile cards
  mobileList: "lg:hidden space-y-3",
  mobileCard: "bg-gradient-to-b from-gray-900/70 to-black border border-red-800 rounded-xl p-4 shadow-sm",
  mobileCardInner: "flex items-start justify-between gap-3",
  mobileMovieTitle: "font-semibold text-white text-base",
  mobileLabel: "text-xs text-gray-400 mt-1",
  mobileValue: "text-gray-200 font-medium",
  mobileEarnings: "text-sm text-red-300 font-semibold",
  mobileAvgLabel: "text-xs text-gray-400 mt-1",
  mobileAvgValue: "text-gray-300",
  mobileEmpty: "text-center py-6 text-gray-500",
  
  // Grid and cards
  gridContainer: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
  messageContainer: "col-span-full text-center text-gray-400 py-8 border border-red-800 rounded-lg",
  bookingCard: "bg-gradient-to-r from-gray-900 to-black border border-red-800 rounded-xl p-4 shadow-lg flex flex-col justify-between",
  
  // Card content
  movieIconContainer: "w-12 h-12 rounded-md bg-red-800 flex items-center justify-center text-white",
  movieTitle: "text-lg font-bold text-red-300",
  bookingId: "text-xs text-gray-400",
  bookingIdValue: "font-mono ml-1 text-xs text-gray-200",
  bookedByLabel: "text-xs text-gray-400 mt-1",
  bookedByValue: "text-sm font-semibold text-gray-200",
  seatsLabel: "text-xs text-gray-400",
  seatsValue: "font-semibold text-gray-200",
  
  // Details section
  detailContainer: "mt-3 text-sm text-gray-300 space-y-2",
  detailItem: "flex items-center gap-2",
  detailIcon: "w-4 h-4 text-red-400",
  auditoriumLabel: "text-xs text-gray-400 mr-2",
  auditoriumValue: "font-semibold text-gray-200",
  
  // Amount section
  amountLabel: "text-xs text-gray-400",
  amountValue: "text-lg font-bold text-red-300"
};


// CSS styles for custom classes
export const customStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600;700&display=swap');
  .card-hover {
    transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px -12px rgba(220, 38, 38, 0.25);
  }
  .filter-btn {
    transition: all 0.18s ease-in-out;
  }
  .gradient-border {
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.06), rgba(185, 28, 28, 0.02));
    border: 1px solid rgba(220, 38, 38, 0.08);
  }
  .scrollbar-thin::-webkit-scrollbar {
    width: 6px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: rgba(75, 85, 99, 0.18);
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: rgba(220, 38, 38, 0.35);
    border-radius: 10px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: rgba(220, 38, 38, 0.5);
  }
`;