require("custom-env").config(true);

const { Op } = require("sequelize");
const ContactQuery = require("../models/contact/contact_query.model");
const AdminNotification = require("../models/notification/admin_notification.model");
const CommonController = require("./common.controller");
const { sendEmail, contactUsSendEmail } = require("./sns.controller");

const createContactQuery = async function (data) {
  // data = {name, email, subject, message}
  try {
    const { name, email, subject, message } = data;
    const __CONTACT_QUERY = await ContactQuery.create({
      name,
      email,
      subject,
      message,
      is_read: false,
      is_reply_sent: false,
      status: "active",
    });

    const __ADMIN_NOTIFICATION = await AdminNotification.create({
      contact_query_id: __CONTACT_QUERY.id,
      is_read: false,
      title: `${subject}`,
      message: `New query received by '${name}'`,
      status: "active",
    });

    try {
      await contactUsSendEmail(
        'sukhdevsmartdata@gmail.com',
        //process.env.CONTACT_FORM_DMIN_EMAIL, // support@thegreenmall.atlassian.net
        `Contact query : ${subject}`,
        `
        <p>Name: ${name}</p>
        <p>Email: ${email}</p>
        <p>Subject: ${subject}</p>
        <p>Message: ${message}</p>
        `,
        process.env.SNS_FROM_EMAIL, // admin@thegreenmall.net
        // process.env.ADMIN_EMAIL,
        email
      );
    } catch (error) {}

    return { contact_query_id: __CONTACT_QUERY.id };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const listContactQueries = async function (data) {
  // data = {q, page, page_size, order_by, order_type}
  try {
    const { q, page, page_size, order_by, order_type } = data;
    const order =
      order_by && order_type
        ? [[order_by == "contact_query_id" ? "id" : order_by, order_type]]
        : [["id", "DESC"]];

    const query = {
      where: {
        name: { [Op.iLike]: `%${q}%` },
        email: { [Op.iLike]: `%${q}%` },
        status: "active",
      },
      attributes: {
        include: [["id", "contact_query_id"]],
        exclude: ["id"],
      },
    };

    const __CONTACT_QUERIES = await CommonController.getPaginationResult({
      Model: ContactQuery,
      query,
      page,
      page_size,
      order,
      as: "contact_queries",
    });

    return __CONTACT_QUERIES;
  } catch (err) {
    throw err;
  }
};

const getContactQuery = async function (data) {
  // data = {contact_query_id}
  try {
    const { contact_query_id } = data;

    const __CONTACT_QUERY = await ContactQuery.findOne({
      where: { id: contact_query_id, status: "active" },
      attributes: {
        include: [["id", "contact_query_id"]],
        exclude: ["id"],
      },
    });

    if (!__CONTACT_QUERY) {
      throw "Contact query not found";
    }

    await ContactQuery.update(
      {
        is_read: true,
      },
      {
        where: { id: contact_query_id },
      }
    );

    return { contact_query: __CONTACT_QUERY };
  } catch (err) {
    throw err;
  }
};

const deleteContactQuery = async function (data) {
  // data = {contact_query_id}
  try {
    const { contact_query_id } = data;

    const __DELETE_CONTACT_QUERY = await ContactQuery.update(
      {
        status: "deleted",
      },
      {
        where: { id: contact_query_id },
      }
    );

    return { is_deleted: true };
  } catch (err) {
    throw err;
  }
};

const replyContactQuery = async function (data) {
  // data = {contact_query_id, reply}
  try {
    const { contact_query_id, reply } = data;
    const __CONTACT_QUERY = await ContactQuery.findOne({
      where: { id: contact_query_id },
    });

    if (!__CONTACT_QUERY) {
      throw "Query not found";
    }

    await ContactQuery.update(
      { is_reply_sent: true, reply },
      { where: { id: contact_query_id } }
    );

    sendEmail(
      __CONTACT_QUERY.email,
      `Contact query: ${__CONTACT_QUERY.subject}`,
      reply,
      process.env.SNS_FROM_EMAIL,
      process.env.NO_REPLY_EMAIL
    );

    return {
      is_reply_sent: true,
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  createContactQuery,
  listContactQueries,
  getContactQuery,
  deleteContactQuery,
  replyContactQuery,
};
