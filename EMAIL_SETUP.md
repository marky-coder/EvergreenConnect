# Email Configuration for Cash Offer Form

The cash offer form is configured to send emails to: **amor2012walid@gmail.com**

## Current Status

✅ **Email system is set up and working!**

When someone submits the "Get Cash Offer" form, the system will:

1. Validate all form fields
2. Send a beautifully formatted HTML email to `amor2012walid@gmail.com`
3. Show a success message to the user
4. Reset the form

## Testing Mode

**Right now, the app is in testing mode.** Since email credentials aren't configured yet, submitted forms will be:

- ✅ Logged to the server console (you can see them in the terminal)
- ✅ Fully validated and processed
- ⚠️ Not actually sent via email (yet)

This allows you to test the form without email setup.

## To Enable Real Email Sending

To send actual emails, add these variables to your `.env` file:

### Option 1: Using Gmail (Recommended)

```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

#### Steps to get Gmail App Password:

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Select app: "Mail"
4. Select device: "Other" → type "Evergreen Website"
5. Click "Generate"
6. Copy the 16-character password
7. Add it to your `.env` file as `EMAIL_PASS`

### Option 2: Using Other Email Providers

For SendGrid, Mailgun, or other SMTP services:

```bash
EMAIL_HOST=smtp.sendgrid.net  # or your provider's SMTP host
EMAIL_PORT=587
EMAIL_USER=apikey  # or your username
EMAIL_PASS=your-api-key
```

## Email Content

When a form is submitted, the email will include:

### Contact Information

- Name
- Email (clickable mailto link)
- Phone (clickable tel link)

### Property Details

- Full address
- City, State, ZIP
- Property type (Single Family, Condo, etc.)
- Condition (Excellent to Major Repair Needed)
- Desired timeline (ASAP to Flexible)

### Additional Information

- Any notes the client added

### Formatting

- Professional HTML email with your brand colors
- Clear sections with icons
- Mobile-responsive design
- Timestamp with timezone
- Reply-to set to the client's email

## Testing the Form

1. **Start your dev server**: `npm run dev`
2. **Go to**: http://localhost:5000/get-offer
3. **Fill out the form** with test data
4. **Click "Get My Free Cash Offer"**
5. **Check your terminal** - you'll see the email content logged

## Production Deployment

When deploying to production (Replit, Vercel, etc.):

1. Add the email environment variables to your hosting platform
2. Restart the server
3. Test the form - emails will be sent for real!

## Troubleshooting

**Form submits but no email?**

- Check the server console for error messages
- Verify EMAIL_USER and EMAIL_PASS are correct
- Make sure you're using an App Password (not your regular Gmail password)

**Gmail blocking the connection?**

- Enable "Less secure app access" (not recommended)
- Better: Use an App Password (see steps above)

**Want to test without Gmail?**

- Use a service like [Mailtrap](https://mailtrap.io/) for testing
- Or use [Ethereal Email](https://ethereal.email/) for fake SMTP testing

## Need Help?

Contact your developer or check the server logs for detailed error messages.
