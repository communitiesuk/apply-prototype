//
// For guidance on how to create routes see:
// https://prototype-kit.service.gov.uk/docs/create-routes
//

const govukPrototypeKit = require('govuk-prototype-kit')
const router = govukPrototypeKit.requests.setupRouter()
const radioButtonRedirect = require('radio-button-redirect')
router.use(radioButtonRedirect)

// Add your routes here

// Logging session data 
 
router.use((req, res, next) => { 
    const log = { 
    method: req.method, 
    url: req.originalUrl, 
    data: req.session.data 
    } 
    console.log(JSON.stringify(log, null, 2)) 
   
    next() 
})

// GET SPRINT NAME - useful for relative templates
router.use('/', (req, res, next) => {
    res.locals.currentURL = req.originalUrl; //current screen
    res.locals.prevURL = req.get('Referrer'); // previous screen
  console.log('previous page is: ' + res.locals.prevURL + " and current page is " + req.url + " " + res.locals.currentURL );
    next();
  });



  router.post('/funding/grant/reports/', function (req, res) {
  // Initialize reports array if it doesn't exist
  if (!req.session.data.reports) {
    req.session.data.reports = []
  }
  
  // Create new report object
  const newReport = {
    id: Date.now().toString(), // unique ID
    reportName: req.body.reportName,
    createdDate: new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }),
    createdBy: 'hugo.furst@communities.gov.uk', 
    lastUpdated: new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }),
    updatedBy: 'mj@communities.gov.uk'
  }
  
  // Add to reports array
  req.session.data.reports.push(newReport)
  
  // Set flag to show we have reports
  req.session.data.setupReport = 'yes'
  
  res.redirect('/funding/grant/reports/?setupReport=yes')
})

// Route to delete a report
router.get('/funding/grant/reports/delete/:id', function (req, res) {
  const reportId = req.params.id
  if (req.session.data.reports) {
    req.session.data.reports = req.session.data.reports.filter(
      report => report.id !== reportId
    )
    
    // If no reports left, reset setupReport flag
    if (req.session.data.reports.length === 0) {
      req.session.data.setupReport = undefined
    }
  }
  res.redirect('/funding/grant/reports/')
})




// In your routes file

// GET route for add section page - captures which report from URL parameter
router.get('/funding/grant/reports/add/section/', function (req, res) {
  // Get report ID from URL parameter and store in session
  const reportId = req.query.reportId
  if (reportId) {
    req.session.data.currentReportId = reportId
  }
  
  // Clear any existing sectionName from session
  delete req.session.data.sectionName
  res.render('funding/grant/reports/add/section/index')
})

// POST route to add section to the current report
router.post('/funding/grant/reports/add/section/another', function (req, res) {
  const reportId = req.session.data.currentReportId // You'll need to set this
  const sectionName = req.body.sectionName
  
  if (!req.session.data.reports || !reportId) {
    // Redirect back if no reports or no current report selected
    return res.redirect('/funding/grant/reports/')
  }
  
  // Find the report we're adding the section to
  const reportIndex = req.session.data.reports.findIndex(report => report.id === reportId)
  
  if (reportIndex === -1) {
    return res.redirect('/funding/grant/reports/')
  }
  
  // Initialize sections array for this report if it doesn't exist
  if (!req.session.data.reports[reportIndex].sections) {
    req.session.data.reports[reportIndex].sections = []
  }
  
  // Create new section
  const newSection = {
    id: Date.now().toString(),
    sectionName: sectionName,
    createdDate: new Date().toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }),
    tasks: [] // For future task functionality
  }
  
  // Add section to the report
  req.session.data.reports[reportIndex].sections.push(newSection)
  
  // Clear the sectionName from session
  delete req.session.data.sectionName
  
  // Redirect back to reports page
  res.redirect('/funding/grant/reports/')
})

// You'll also need to modify your existing "Add sections" link to set currentReportId
router.get('/funding/grant/reports/add/section/:reportId', function (req, res) {
  // Set which report we're adding sections to
  req.session.data.currentReportId = req.params.reportId
  // Clear any existing sectionName
  delete req.session.data.sectionName
  res.redirect('/funding/grant/reports/add/section/')
})