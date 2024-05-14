const stripe = require('stripe')(process.env.STRIPE_SECRET);
const express = require('express');
const app = require('../app');
const nodemailer = require('nodemailer');
const Email = require('./../utils/email');
const Users = require('../models/userModel');

app.use(express.json());

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password',
  },
});

exports.getInvoice = (req, res, next) => {
    app.post('/webhook', async (req, res) => {
        const event = req.body;
      
        if (event.type === 'checkout.session.completed') {
          const session = res.session;
          const urlParams = new URLSearchParams(new URL(req.session.success_url).search);
          const userId = urlParams.get('user');
          const user = await Users.findById(userId);
          const customerId = userId;
          const email = session.success;
          const amount = session.amount_total/100;
          const productId = session.client_reference_id;
      
          const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 30,
            description: `Invoice for ${productId} Tour`,
            payment_behavior: 'paid',
            amount: amount,
            currency: 'usd',
          });
          await new Email(user, '/my-bookings').send('invoice','Booking Successfull', invoice.invoice_pdf);
      
          console.log('Invoice generated:', invoice.id);
        }
      
        return res.sendStatus(200);
      });
      return;
      
}
