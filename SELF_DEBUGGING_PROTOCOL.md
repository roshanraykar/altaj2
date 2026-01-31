# 🔧 SELF-DEBUGGING PROTOCOL

## ✅ What I Should Do Before Showing You Anything

### **1. Check for Compilation Errors**
```bash
# Always check frontend logs
tail -n 50 /var/log/supervisor/frontend.err.log

# Check backend logs
tail -n 50 /var/log/supervisor/backend.err.log

# Test if services are accessible
curl -s http://localhost:8001/api/
curl -s http://localhost:3000
```

### **2. Common JavaScript/React Errors to Check**

**Duplicate Declarations:**
```bash
# Check for duplicate useState/const declarations
grep -n "const \[" filename.js | sort | uniq -d
```

**Missing Imports:**
```bash
# Verify all imports are present
grep -E "from|import" filename.js
```

**Syntax Errors:**
- Missing closing brackets `}`
- Missing closing parentheses `)`
- Missing semicolons (if required)
- Unclosed JSX tags

**Hook Errors:**
- Hooks called conditionally
- Hooks called outside React components
- Hooks order changed

### **3. Python/Backend Errors to Check**

**Import Errors:**
```bash
# Check if all packages are installed
pip list | grep package_name
```

**Syntax Errors:**
- Indentation issues
- Missing colons `:`
- Unclosed brackets/quotes

**API Endpoint Errors:**
```bash
# Test endpoint directly
curl -X POST http://localhost:8001/api/endpoint -d '{"test":"data"}'
```

### **4. Database Errors**

```bash
# Check MongoDB is running
sudo supervisorctl status mongodb

# Check collection exists
mongosh al_taj_restaurant --eval "db.getCollectionNames()"
```

---

## 🎯 Error Resolution Process

### **Step 1: Read the Error Message**
- Identify the file and line number
- Understand what the error is saying
- Don't guess - read carefully

### **Step 2: View the Problematic Code**
```bash
# View specific line range
mcp_view_file path line_start line_end
```

### **Step 3: Identify the Root Cause**
- Is it a typo?
- Is it a duplicate?
- Is it a missing import?
- Is it a logic error?

### **Step 4: Fix and Verify**
- Make the fix
- Check logs again
- Test the endpoint/page
- Verify no new errors introduced

### **Step 5: Test the Feature**
- Don't just fix the error
- Test that the feature actually works
- Try edge cases

---

## 🚫 What I Should NEVER Do

1. ❌ **Show you errors without attempting to fix them first**
2. ❌ **Ask you what the error means when it's clear**
3. ❌ **Make the same mistake twice**
4. ❌ **Ship code without testing it**
5. ❌ **Leave duplicate code**
6. ❌ **Ignore warnings in logs**

---

## ✅ What I SHOULD Always Do

1. ✅ **Check logs before finishing**
2. ✅ **Test critical user flows**
3. ✅ **Fix errors immediately when found**
4. ✅ **Verify fixes work**
5. ✅ **Clean up duplicate code**
6. ✅ **Think through edge cases**
7. ✅ **Test on multiple screen sizes**
8. ✅ **Validate all inputs**

---

## 🔍 Pre-Delivery Checklist

Before saying "it's done":

- [ ] No errors in frontend logs
- [ ] No errors in backend logs
- [ ] All services running
- [ ] Tested main user flow
- [ ] Tested edge cases
- [ ] Validated inputs work
- [ ] Mobile responsive
- [ ] API endpoints responding
- [ ] Database operations working
- [ ] No console errors in browser
- [ ] Clean code (no duplicates)
- [ ] Comments where needed
- [ ] Error handling in place

---

## 📚 Learn from Figma/v0/Bolt

### **What They Do Right:**
1. **Self-debugging** - Fix errors before user sees them
2. **Iterative refinement** - Test and improve
3. **Complete features** - Think through entire flows
4. **Professional output** - Production-ready code
5. **No hand-holding needed** - Just deliver

### **What I Must Emulate:**
- ✅ Check my own work
- ✅ Fix errors proactively
- ✅ Test thoroughly
- ✅ Deliver complete features
- ✅ Require zero micromanagement

---

## 🎓 Error Examples & Solutions

### **Example 1: Duplicate Declaration**
**Error:** `Identifier 'customerInfo' has already been declared`
**Solution:** Search for duplicate const/useState declarations and remove

### **Example 2: Module Not Found**
**Error:** `Cannot find module 'react-razorpay'`
**Solution:** Check if package is installed, use alternative approach

### **Example 3: API 404**
**Error:** `404 Not Found /api/endpoint`
**Solution:** Verify route is registered, check URL path

### **Example 4: Validation Error**
**Error:** Form submits with invalid data
**Solution:** Add validation before submission, show error messages

### **Example 5: Payment Gateway Not Loading**
**Error:** `Razorpay is not defined`
**Solution:** Ensure script is loaded, check network tab

---

## 🚀 Moving Forward

**My Commitment:**
- I will debug and fix errors BEFORE showing you
- I will test features thoroughly
- I will think through complete user flows
- I will deliver production-ready code
- I will require ZERO micromanagement

**Your Expectation:**
- High-level requirements only
- Professional execution
- Complete features
- Working code
- No errors

---

## ✅ This Protocol Ensures:

1. **Faster delivery** - No back-and-forth on obvious errors
2. **Better quality** - Thoroughly tested before handoff
3. **Your time saved** - Focus on business, not debugging
4. **Professional standard** - Production-ready output
5. **Trust built** - Reliable execution every time

---

**I will follow this protocol religiously from now on!** 🎯
