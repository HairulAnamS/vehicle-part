const { User, ReminderHistory } = require('../models');
const { getUserReminders } = require('../services/reminderService');
const { sendEmail } = require('../utils/mailer');

exports.triggerReminders = async (req, res) => {
  try {
    const users = await User.findAll();

    let processedCount = 0;

    for (const user of users) {
      const reminders = await getUserReminders(user.id);

      if (reminders.length > 0) {
        // Build HTML content
        let htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <h2>Halo ${user.name},</h2>
            <p>Berikut adalah pengingat perawatan untuk kendaraan Anda:</p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
              <thead>
                <tr style="background-color: #f8f9fa;">
                  <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Kendaraan</th>
                  <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Suku Cadang</th>
                  <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Status</th>
                  <th style="padding: 10px; border: 1px solid #dee2e6; text-align: left;">Pesan</th>
                </tr>
              </thead>
              <tbody>
        `;

        for (const reminder of reminders) {
          const statusColor = reminder.status === 'OVERDUE' ? '#dc3545' : '#ffc107';
          const statusText = reminder.status === 'OVERDUE' ? 'Terlewat' : 'Peringatan';

          htmlContent += `
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${reminder.vehicle.nopol}</td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${reminder.sparepart.name}</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; color: ${statusColor}; font-weight: bold;">${statusText}</td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${reminder.message}</td>
            </tr>
          `;
        }

        htmlContent += `
              </tbody>
            </table>
            <p style="margin-top: 20px; font-size: 12px; color: #6c757d;">
              Pesan ini dikirim secara otomatis. Mohon segera jadwalkan pergantian suku cadang kendaraan Anda.
            </p>
          </div>
        `;

        try {
          await sendEmail(
            user.email,
            'Pengingat Perawatan Kendaraan Anda',
            htmlContent
          );

          // Log success
          await ReminderHistory.create({
            user_id: user.id,
            email: user.email,
            status: 'SUCCESS',
            details: 'Email terkirim dengan sukses'
          });
        } catch (emailError) {
          console.error(`Gagal mengirim email ke ${user.email}:`, emailError);
          // Log failure
          await ReminderHistory.create({
            user_id: user.id,
            email: user.email,
            status: 'FAILED',
            details: emailError.message || 'Error tidak diketahui saat mengirim email'
          });
        }
        processedCount++;
      }
    }

    res.json({ success: true, message: `Berhasil memproses ${processedCount} pengguna dengan reminder.` });
  } catch (err) {
    console.error('Error pada cron job:', err);
    res.status(500).json({ error: err.message });
  }
};
