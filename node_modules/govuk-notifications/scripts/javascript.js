const platform = navigator.userAgent.includes('Macintosh') ? 'mac' : navigator.userAgent.includes('Windows') ? 'win' : 'other'
document.body.classList.add(`gukn-notification-${platform}`)