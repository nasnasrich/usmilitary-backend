import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
export const sendEmergencyLeave = async (req, res) => {
  const {
    employeeName,
    employeeAddress,
    employeeId,
    currentLocation,
    applicantName,
    applicantAddress,
    phone,
    email,
    reason,
  } = req.body;

  // Check required fields
  if (
    !employeeName ||
    !employeeAddress ||
    !employeeId ||
    !currentLocation ||
    !applicantName ||
    !applicantAddress ||
    !phone ||
    !email ||
    !reason
  ) {
    return res.status(400).json({
      message: "Please complete all required fields.",
    });
  }

  try {
    // Create Resend AFTER environment variables are loaded
    const resend = new Resend(process.env.RESEND_API_KEY);

    // ==========================================
    // EMAIL 1: SEND APPLICATION TO ADMIN
    // ==========================================

    const adminEmail = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      replyTo: email,
      subject: "Emergency Leave Application Received",

      html: `
        <div style="font-family: Arial, sans-serif; color: #333;">

          <h2>Emergency Leave Application</h2>

          <hr>

          <h3>Employee Information</h3>

          <p>
            <strong>Employee Name:</strong>
            ${employeeName}
          </p>

          <p>
            <strong>Employee Address:</strong>
            ${employeeAddress}
          </p>

          <p>
            <strong>Employee ID:</strong>
            ${employeeId}
          </p>

          <p>
            <strong>Current Location:</strong>
            ${currentLocation}
          </p>

          <h3>Applicant Information</h3>

          <p>
            <strong>Applicant Name:</strong>
            ${applicantName}
          </p>

          <p>
            <strong>Applicant Address:</strong>
            ${applicantAddress}
          </p>

          <p>
            <strong>Phone:</strong>
            ${phone}
          </p>

          <p>
            <strong>Email:</strong>
            ${email}
          </p>

          <h3>Reason for Leave</h3>

          <p>
            ${reason}
          </p>

          <hr>

          <p>
            Emergency Leave application submitted through the portal.
          </p>

        </div>
      `,
    });

    if (adminEmail.error) {
      console.error("Admin email error:", adminEmail.error);

      return res.status(500).json({
        message: "Failed to send Emergency Leave application.",
      });
    }

    // ==========================================
    // EMAIL 2: AUTOMATIC REPLY TO APPLICANT
    // ==========================================

    const applicantEmail = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: email,
      replyTo: process.env.ADMIN_EMAIL,
      subject: "Emergency Leave Application Received",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            font-size: 16px;
            color: #333;
            line-height: 1.6;
          "
        >

          <p
            style="
              font-size: 20px;
              font-weight: 600;
            "
          >
            Leave Administration Team
          </p>

          <p
            style="
              padding-top: 16px;
              border-top: 1px solid #eaeaea;
            "
          >
            Dear ${applicantName},
          </p>

          <p>
            Your Emergency Leave request has been received and is currently
            under review.
          </p>

          <p
            style="
              padding-top: 16px;
              border-top: 1px solid #eaeaea;
            "
          >
            Kind regards,<br>
            Leave Administration Team
          </p>

        </div>
      `,
    });

    if (applicantEmail.error) {
      console.error("Applicant email error:", applicantEmail.error);

      return res.status(500).json({
        message:
          "Application received, but automatic reply could not be sent.",
      });
    }

    return res.status(200).json({
      message: "Emergency Leave application submitted successfully.",
    });
  } catch (error) {
    console.error("Emergency Leave email error:", error);

    return res.status(500).json({
      message: "Failed to send Emergency Leave application.",
    });
  }
};