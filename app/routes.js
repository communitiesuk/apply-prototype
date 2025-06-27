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
    const reportId = req.query.reportId || req.session.data.currentReportId
    const returnTo = req.query.returnTo // Track where to return after adding section
    
    if (reportId) {
        req.session.data.currentReportId = reportId
    }
    
    // Store return destination (defaults to reports list)
    req.session.data.returnToAfterSection = returnTo || 'reports'
    
    // Clear any existing sectionName from session
    delete req.session.data.sectionName
    res.render('funding/grant/reports/add/section/index')
})

// POST route to add section to the current report
router.post('/funding/grant/reports/add/section/another', function (req, res) {
    const reportId = req.session.data.currentReportId
    const sectionName = req.body.sectionName
    const returnTo = req.session.data.returnToAfterSection || 'reports'
    
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
    
    // Always update currentSections with fresh data
    req.session.data.currentSections = [...req.session.data.reports[reportIndex].sections]
    req.session.data.reportName = req.session.data.reports[reportIndex].reportName
    
    // Clear the sectionName from session
    delete req.session.data.sectionName
    delete req.session.data.returnToAfterSection
    
    // Force session save before redirecting
    req.session.save(function(err) {
        if (err) {
            console.log('Session save error:', err)
        }
        // Redirect based on where they came from
        if (returnTo === 'sections') {
            res.redirect('/funding/grant/reports/sections?reportId=' + reportId)
        } else {
            res.redirect('/funding/grant/reports/')
        }
    })
})

// You'll also need to modify your existing "Add sections" link to set currentReportId
router.get('/funding/grant/reports/add/section/:reportId', function (req, res) {
    // Set which report we're adding sections to
    req.session.data.currentReportId = req.params.reportId
    // Clear any existing sectionName
    delete req.session.data.sectionName
    res.redirect('/funding/grant/reports/add/section/')
})

// GET route for sections page (modified to handle delete confirmation and force data refresh)
router.get('/funding/grant/reports/sections', function (req, res) {
    const reportId = req.query.reportId || req.session.data.currentReportId
    
    if (!reportId) {
        return res.redirect('/funding/grant/reports/')
    }
    
    // Always get fresh data from the reports array
    const currentReport = req.session.data.reports?.find(report => report.id === reportId)
    if (!currentReport) {
        // Clear stale session data and redirect
        delete req.session.data.currentSections
        delete req.session.data.reportName
        delete req.session.data.currentReportId
        return res.redirect('/funding/grant/reports/')
    }
    
    // Update session with fresh data
    req.session.data.currentReportId = reportId
    req.session.data.reportName = currentReport.reportName
    req.session.data.currentSections = currentReport.sections ? [...currentReport.sections] : []
    
    // Handle cancel parameter - redirect to clear URL
    if (req.query.cancel === 'true') {
        // Clear confirmation data
        delete req.session.data.deleteConfirm
        delete req.session.data.deleteSectionId
        delete req.session.data.deleteSectionName
        
        // Force session save and redirect to clean URL
        req.session.save(function(err) {
            if (err) {
                console.log('Session save error:', err)
            }
            res.redirect('/funding/grant/reports/sections?reportId=' + reportId)
        })
        return
    }
    
    // Handle delete confirmation parameters
    if (req.query.deleteConfirm === 'true') {
        req.session.data.deleteConfirm = true
        req.session.data.deleteSectionId = req.query.deleteSectionId
        req.session.data.deleteSectionName = req.query.deleteSectionName
    } else {
        // Clear confirmation data if not in confirmation mode
        delete req.session.data.deleteConfirm
        delete req.session.data.deleteSectionId
        delete req.session.data.deleteSectionName
    }
    
    // Force session save before rendering
    req.session.save(function(err) {
        if (err) {
            console.log('Session save error:', err)
        }
        res.render('funding/grant/reports/sections')
    })
})

// GET route for actually deleting a section (modified for inline confirmation)
router.get('/funding/grant/reports/sections/delete/:sectionId', function (req, res) {
    const sectionId = req.params.sectionId
    const reportId = req.query.reportId || req.session.data.currentReportId
    const confirm = req.query.confirm
    
    if (!reportId || !sectionId) {
        return res.redirect('/funding/grant/reports/')
    }
    
    // Find the report
    const reportIndex = req.session.data.reports.findIndex(report => report.id === reportId)
    if (reportIndex === -1) {
        return res.redirect('/funding/grant/reports/')
    }
    
    // If confirmed, actually delete the section
    if (confirm === 'yes') {
        // Remove the section
        if (req.session.data.reports[reportIndex].sections) {
            req.session.data.reports[reportIndex].sections = req.session.data.reports[reportIndex].sections.filter(
                section => section.id !== sectionId
            )
        }
        
        // Force update the currentSections immediately with fresh data
        req.session.data.currentSections = req.session.data.reports[reportIndex].sections ? 
            [...req.session.data.reports[reportIndex].sections] : []
        
        // Clear any confirmation data
        delete req.session.data.deleteConfirm
        delete req.session.data.deleteSectionId
        delete req.session.data.deleteSectionName
        
        // Force session save before redirecting
        req.session.save(function(err) {
            if (err) {
                console.log('Session save error:', err)
            }
            // Redirect back to sections page
            res.redirect('/funding/grant/reports/sections?reportId=' + reportId)
        })
    } else {
        // This shouldn't happen with the new flow, but redirect back if accessed directly
        res.redirect('/funding/grant/reports/sections?reportId=' + reportId)
    }
})

// Remove or comment out the old POST route for deleting sections since we're not using it anymore
/*
router.post('/funding/grant/reports/sections/delete', function (req, res) {
    // This route is no longer needed with inline confirmation
})
*/

module.exports = router