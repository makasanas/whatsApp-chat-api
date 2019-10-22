const contactSchema = require('./../schema/contact');

module.exports.creat = async (contactObj) => {
    try {
      const contact = await new contactSchema(contactObj);
      const contactSave = await contact.save();
      return  contactSave;
    } catch (error) {
      throw error;
    }
}