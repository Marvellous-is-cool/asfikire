# Username Fix Test Checklist

Use this checklist to verify all aspects of the username fix implementation are working correctly.

## Preliminary Setup

- [ ] Clear browser cache and cookies
- [ ] Run `localStorage.removeItem("anglican_auth")` in browser console
- [ ] Deploy Firebase security rules using `./deploy-firebase-rules.sh`

## 1. Database Check

- [ ] Navigate to `/debug` page
- [ ] Use Database Debugger to search for username "marvellous"
  - [ ] If found, check that username is lowercase in database
  - [ ] Note the UID and display name
- [ ] Use Database Debugger to search for username "goodness"
  - [ ] If found, check relation to "marvellous" (might be a duplicate)

## 2. Fix Duplicate Usernames

- [ ] On the `/debug` page, use the Username Fix Utility
- [ ] Click "Scan for Duplicate Usernames"
- [ ] If duplicates exist, click "Fix X Duplicate Groups"
- [ ] After fix, run scan again to verify no duplicates remain

## 3. Authentication Test

- [ ] On the `/debug` page, scroll to Authentication Test section
- [ ] Test username "marvellous"
  - [ ] Verify input username matches returned username
  - [ ] Check that UID matches the one from database check
- [ ] Test other usernames that had issues
  - [ ] Verify each input username matches its returned username

## 4. Voting Process Test

- [ ] Clear localStorage: `localStorage.removeItem("anglican_auth")`
- [ ] Navigate to voting page (`/vote`)
- [ ] Enter username "marvellous"
- [ ] Complete voting process
- [ ] Verify the vote was recorded with username "marvellous"

## 5. Admin View Test

- [ ] Log in to admin panel
- [ ] Check votes for username "marvellous"
- [ ] Verify username displays consistently throughout admin views

## 6. Debug Tools Test

- [ ] Run debug-auth.js in console: `fetch('/debug-auth.js').then(r => r.text()).then(t => eval(t))`
- [ ] Verify anglicanAuthDebug tools are available
- [ ] Test compareUsername with "marvellous"
- [ ] Run username-test.js for automated verification

## 7. Edge Case Tests

- [ ] Test with capitalized username: "Marvellous"
  - [ ] Verify it authenticates and displays as "marvellous"
- [ ] Test with mixed case: "mArVeLLoUs"
  - [ ] Verify it authenticates and displays as "marvellous"
- [ ] Test with username that previously showed incorrectly
  - [ ] Verify it now displays consistently

## Results

| Test Case              | Expected Result                    | Actual Result | Pass/Fail |
| ---------------------- | ---------------------------------- | ------------- | --------- |
| Database check         | Username exists in lowercase       |               |           |
| Duplicate fix          | No duplicates after fix            |               |           |
| Auth test              | Input username = returned username |               |           |
| Vote with "marvellous" | Displays as "marvellous"           |               |           |
| Admin view             | Username consistent                |               |           |
| Debug tools            | Work as expected                   |               |           |
| Case sensitivity       | Works regardless of input case     |               |           |

## Notes

- If any test fails, document the exact behavior observed
- For any failures, check browser console for errors
- Test on multiple browsers if possible (Chrome, Firefox, Safari)

---

Report completed by: **\*\***\_\_\_\_**\*\***
Date: **\*\***\_\_\_\_**\*\***
