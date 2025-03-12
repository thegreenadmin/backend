require('custom-env').config(true)

const { storeUserVerification_Template, createOrder_Template, orderStatus_Template, createOrderWithoutDeliveryDate_Template } = require('../config/email_templates.config');
const logger = require('../logger/logger');
const MESSAGES = require('../utils/messages.util');
const fbaseAdmin = require("firebase-admin");
var fbaseServiceAccount = require("../thegreenmall-76d46f6495e2.json");
const { PinpointClient, SendMessagesCommand } = require("@aws-sdk/client-pinpoint");
const { SESClient, SendEmailCommand, SendRawEmailCommand } = require("@aws-sdk/client-ses");

const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
}

const pinpoint = new PinpointClient(awsConfig);
const ses = new SESClient(awsConfig);


fbaseAdmin.initializeApp({
  credential: fbaseAdmin.credential.cert(fbaseServiceAccount)
})








const sendSMSMessage = async function (phone, phoneCode, message) {

  try {
    return await new Promise(async (resolve, reject) => {
      const params = {
        ApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID, // replace with your Pinpoint application ID
        MessageRequest: {
          Addresses: {
            [phoneCode + phone]: {
              ChannelType: 'SMS'
            }
          },
          MessageConfiguration: {
            SMSMessage: {
              Body: message, // replace with your message text
              MessageType: 'TRANSACTIONAL', // or 'PROMOTIONAL'
              SenderId: process.env.AWS_PINPOINT_SENDER_ID // replace with your sender ID
            }
          }
        }
      };

      const command = new SendMessagesCommand(params);
      const response = await pinpoint.send(command);
      resolve(true);
    })
  } catch (err) {
    throw err;
  }


}

const sendOtp = async function (phone, phoneCode, otp) {
  return await sendSMSMessage(phone, phoneCode, `Your login OTP : ${otp}`);
}


const sendEmail = async function (to, subject, message,fromEmail) {
  try {
    return await new Promise(async (resolve, reject) => {
      const params = {
        ApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID, // replace with your Pinpoint application ID
        MessageRequest: {
          Addresses: {
            [to]: {
              ChannelType: 'EMAIL'
            }
          },
          MessageConfiguration: {
            EmailMessage: {
              FromAddress: fromEmail,
              ReplyToAddresses: [replyToEmail], // Add Reply-To address here
              SimpleEmail: {
                Subject: {
                  Charset: 'UTF-8',
                  Data: subject // replace with your email subject
                },
                HtmlPart: {
                  Charset: 'UTF-8',
                  Data: message // replace with your email HTML body
                },
                TextPart: {
                  Charset: "UTF-8",
                  Data: message
                }
              }
            }
          }
        }
      };

      const data = await pinpoint.send(new SendMessagesCommand(params));

      const {
        MessageResponse: { Result },
      } = data;
  
      const recipientResult = Result[to];
  
      if (recipientResult.StatusCode !== 200) {
        reject(recipientResult.StatusMessage);
      } else {
        resolve(true)
      }
  

      // pinpoint.sendMessages(params, function (err, data) {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     if (data['MessageResponse']['Result'][to]['StatusCode'] >= 400) {
      //       reject(data['MessageResponse']['Result'][to]['StatusMessage']);
      //     }
      //     resolve(true)
      //   }
      // });
    })
  } catch (err) {
    throw err;
  }
}
const contactUsSendEmail = async function (to, subject, message,fromEmail,replyToEmail) {
  try {
    return await new Promise(async (resolve, reject) => {    
      const params = {
        ApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID, // replace with your Pinpoint application ID
        MessageRequest: {
          Addresses: {
            [to]: {
              ChannelType: 'EMAIL'
            }
          },
          MessageConfiguration: {
            EmailMessage: {
              FromAddress: fromEmail,
              ReplyToAddresses: [replyToEmail], // Add Reply-To address here
              SimpleEmail: {
                Subject: {
                  Charset: 'UTF-8',
                  Data: subject // replace with your email subject
                },
                HtmlPart: {
                  Charset: 'UTF-8',
                  Data: message // replace with your email HTML body
                },
                TextPart: {
                  Charset: "UTF-8",
                  Data: message
                }
              }
            }
          }
        }
      };

      const data = await pinpoint.send(new SendMessagesCommand(params));

      const {
        MessageResponse: { Result },
      } = data;
  
      const recipientResult = Result[to];
  
      if (recipientResult.StatusCode !== 200) {
        reject(recipientResult.StatusMessage);
      } else {
        resolve(true)
      }
  

      // pinpoint.sendMessages(params, function (err, data) {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     if (data['MessageResponse']['Result'][to]['StatusCode'] >= 400) {
      //       reject(data['MessageResponse']['Result'][to]['StatusMessage']);
      //     }
      //     resolve(true)
      //   }
      // });
    })
  } catch (err) {
    throw err;
  }
}


// const createRawEmail = (params, attachmentName, attachmentBuffer) => {
//   const boundary = 'PINPOINT_BOUNDARY';

//   let rawEmail = `From: ${params.Source}\n`;
//   rawEmail += `To: ${params.Destination.ToAddresses.join(',')}\n`;
//   rawEmail += `Subject: ${params.Message.Subject.Data}\n`;
//   rawEmail += `MIME-Version: 1.0\n`;
//   rawEmail += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`;

//   rawEmail += `--${boundary}\n`;
//   rawEmail += `Content-Type: text/html\n\n`;
//   rawEmail += `${params.Message.Body.Html.Data}\n\n`;

//   rawEmail += `--${boundary}\n`;
//   rawEmail += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="${attachmentName}"\n`;
//   rawEmail += `Content-Disposition: attachment; filename="${attachmentName}"\n`;
//   rawEmail += `Content-Transfer-Encoding: base64\n\n`;
//   rawEmail += attachmentBuffer.toString('base64');
//   rawEmail += `\n\n--${boundary}--`;

//   return rawEmail;
// };


const createRawEmail = (params, attachmentName, attachmentBuffer) => {
  const boundary = 'PINPOINT_BOUNDARY';

  if (!Buffer.isBuffer(attachmentBuffer)) {
    throw new Error('Invalid attachmentBuffer. It must be a Buffer object.');
  }

  let rawEmail = `From: ${params.Source}\n`;
  rawEmail += `To: ${params.Destination.ToAddresses.join(',')}\n`;
  rawEmail += `Subject: ${params.Message.Subject.Data}\n`;
  rawEmail += `MIME-Version: 1.0\n`;
  rawEmail += `Content-Type: multipart/mixed; boundary="${boundary}"\n\n`;

  rawEmail += `--${boundary}\n`;
  rawEmail += `Content-Type: text/html\n\n`;
  rawEmail += `${params.Message.Body.Html.Data}\n\n`;

  rawEmail += `--${boundary}\n`;
  rawEmail += `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; name="${attachmentName}"\n`;
  rawEmail += `Content-Disposition: attachment; filename="${attachmentName}"\n`;
  rawEmail += `Content-Transfer-Encoding: base64\n\n`;
  rawEmail += attachmentBuffer.toString('base64');
  rawEmail += `\n\n--${boundary}--`;

  return rawEmail;
};



const sendXLSXEmail = async function(to, subject, fileName, fileBuffer, message) {
  try{
    return await new Promise(async (resolve, reject) => {
      const params = {
        Source: "HiDigital <"+process.env.SNS_FROM_EMAIL+">", // Replace with the sender's email address
        Destination: {
          ToAddresses: [to] // Replace with the recipient's email address
        },
        Message: {
          Subject: {
            Data: subject
          },
          Body: {
            Html: {
              Data: '<p>'+message+'</p>'
            }
          }
        },
        ReplyToAddresses: [],
        Tags: [],
      };

      const sendParams = {
        // Source: params.Source,
        RawMessage: {
          Data: Buffer.from(createRawEmail(params, fileName, fileBuffer), 'utf8') ,
        }
      };
      const command = new SendRawEmailCommand(sendParams);
      try{
        console.log(command)
        await ses.send(command);
        resolve(true)
      }catch(err) {
        reject(err);
      }
      
      // ses.sendRawEmail(sendParams, function (err, data) {
      //   if (err) {
      //     reject(err);
      //   } else {
      //     resolve(true)
      //   }
      // });
    })

  }catch(err) {
    throw err;
  }
}




const sendStoreUserEmail = async function (user, store, verificationCode, storeUserId) {
  try{
    return await sendEmail(
      user.email,
      MESSAGES.STORE_USER_CREATION_SUBJECT,
      storeUserVerification_Template(store.store_name, verificationCode, storeUserId),
      process.env.ADMIN_EMAIL
    );
  }catch(err) {
    throw err;
  }
}


const createAndSendCreateOrderEmails = async function(order, emails = [], title, message) {
  let orderTemplate = order.delivery_service_id == 2? createOrder_Template(order, title, message) : createOrderWithoutDeliveryDate_Template(order, title, message);
  try{    
    emails.forEach((email) => {
      sendEmail(
        email,
        title,
        orderTemplate,
        process.env.NO_REPLY_EMAIL 
      )
    })
  }catch(err) {
    // logger.log(err);
  }
}

const sendOrderStatusEmail = async function(order, order_items, emails = [], title, message) {
  try{
    emails.forEach((email) => {
      sendEmail(
        email,
        title,
        orderStatus_Template(order, order_items, title, message),
        process.env.NO_REPLY_EMAIL
      )
    })
  }catch(err) {
    // logger.log(err);
  }
}




const sendFCMPushNotification = async function(title, message, token) {
  try{
    var options = {
      priority: "high",
      timeToLive: 60 * 60 * 24,
    };

    const notification = {
      title,
      body: message,
      sound: 'default'
    }

    return await new Promise((resolve, reject) => {
      fbaseAdmin.messaging().sendToDevice(token, {notification}, options).
        then((response) => {resolve(response)}).
        catch((err) => {reject(err)})
    })
  }catch(err) {
    return err;
  }
}



const sendGCMPushNotification = async function (title, message, token) {
  try {

    return await new Promise((resolve, reject) => {
      const params = {
        ApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID,
        MessageRequest: {
          Addresses: {
            [token]: {
              ChannelType: 'GCM',
            },
          },
          MessageConfiguration: {
            GCMMessage: {
              Action: 'OPEN_APP',
              Title: title,
              Body: message,
              Sound: 'default',
              Priority: 'high'
            },
          },
        },
      };

      pinpoint.sendMessages(params, function (err, data) {
        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          if (data['MessageResponse']['Result'][token]['StatusCode'] >= 400) {
            throw data['MessageResponse']['Result'][token]['StatusMessage']
          }
          resolve(true)
        }
      });
    })
  } catch (err) {
    return err;
  }
}


const sendAPNSPushNotification = async function (title, message, token) {
  try {
    return await new Promise((resolve, reject) => {
      const params = {
        ApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID,
        MessageRequest: {
          Addresses: {
            [token]: {
              ChannelType: 'APNS',
            },
          },
          MessageConfiguration: {
            APNSMessage: {
              Action: 'OPEN_APP',
              Title: title,
              Body: message,
              Sound: 'default',
              Priority: 'high'
            },
          },
        },
      };

      pinpoint.sendMessages(params, function (err, data) {
        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          if (data['MessageResponse']['Result'][token]['StatusCode'] >= 400) {
            throw data['MessageResponse']['Result'][token]['StatusMessage']
          }
          resolve(true)
        }
      });
    })
  } catch (err) {
    return err;
  }
}

const sendMultipleFCMPushNotification = async function (sessionTokens = [], title, message, data) {
  try {
    const tokens = sessionTokens.map((st) => st.device_token);
    if (tokens.length === 0) {
      throw new Error("No device tokens provided");
    }
    console.log("Device tokens", tokens);
    for (const token of tokens) {
      try {
        const response = await fbaseAdmin.messaging().send({
          token,
          notification: {
            title,
            body: message,
          },
          data, // Ensure this is an object with string key-value pairs
        });
        console.log("Message sent successfully to:", token, response);
        return response;
      } catch (error) {
        console.error("Error sending to token:", token, error);
        throw error;
      }
    }
  } catch (err) {
    console.error("Error sending FCM notifications:", err.message);
    throw err;
  }
};

const sendMultipleGCMPushNotification = async function (sessionTokens = [], title, message) {
  try {

    const tokens = {

    }

    sessionTokens.forEach((token, i) => {
      tokens[token.device_token] = {
        ChannelType: 'GCM'
      }
    })

    return await new Promise((resolve, reject) => {
      const params = {
        ApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID,
        MessageRequest: {
          Addresses: {
            ...tokens
          },
          MessageConfiguration: {
            GCMMessage: {
              Action: 'OPEN_APP',
              Title: title,
              Body: message,
              Sound: 'default',
              Priority: 'high'
            },
          },
        },
      };

      pinpoint.sendMessages(params, function (err, data) {
        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          resolve(data)
        }
      });
    })
  } catch (err) {

    return err;
  }
}



const sendMultipleAPNSPushNotifiction = async function (sessionTokens = [], title, message, data) {
  try {

    const tokens = {

    }

    sessionTokens.forEach(token => {
      tokens[token.device_token] = {
        ChannelType: 'APNS'
      }
    })


    return await new Promise((resolve, reject) => {
      const params = {
        ApplicationId: process.env.AWS_PINPOINT_APPLICATION_ID,
        MessageRequest: {
          Addresses: {
            ...tokens
          },
          MessageConfiguration: {
            MessageConfiguration: {
              APNSMessage: {
                Action: 'OPEN_APP',
                Title: title,
                Body: message,
                Sound: 'default',
                Priority: 'high',
                Data: data
              },
            },
          },
        },
      };

      pinpoint.sendMessages(params, function (err, data) {
        if (err) {
          console.log(err)
          reject(err)
        }
        else {
          resolve(data['MessageResponse']['Result'])
        }
      });
    })
  } catch (err) {
    return err;
  }
}



const sendMutliPushNotifications = async function (sessionTokens = [], title, message, data) {
  try {

    const gcmSessionTokens = []
    const apnsSessionTokens = []

    sessionTokens.forEach((st) => {
      if (st.device_type && st.device_type == 'GCM') {
        gcmSessionTokens.push(st);
      }
      else if (st.device_type && st.device_type == 'APNS') {
        apnsSessionTokens.push(st)
      }
    });

    if (gcmSessionTokens.length) {
      await sendMultipleFCMPushNotification(gcmSessionTokens, title, message, data);
      // await sendMultipleGCMPushNotification(gcmSessionTokens, title, message)
    }
    if (apnsSessionTokens.length) {
      await sendMultipleFCMPushNotification(apnsSessionTokens, title, message, data)
    }
  } catch (err) {
    return err;
  }
}








module.exports = {
  sendSMSMessage,
  sendOtp,
  sendEmail,
  sendStoreUserEmail,
  sendGCMPushNotification,
  sendFCMPushNotification,
  sendAPNSPushNotification,
  sendMutliPushNotifications,
  createAndSendCreateOrderEmails,
  sendOrderStatusEmail,
  sendXLSXEmail,
  contactUsSendEmail
}