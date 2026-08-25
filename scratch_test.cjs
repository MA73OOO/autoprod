const { db } = require('./src/prisma/db');

async function test() {
  try {
    const userId = "8b2c2580-3a60-44fa-8a70-e2746f7ff211"; // Mateo's user id from token
    console.log("Checking user...");
    let user = await db.orm.public.User.where({ id: userId }).first();
    console.log("User in DB:", user);
    
    if (!user) {
      console.log("User not found, syncing...");
      user = await db.orm.public.User.create({
        id: userId,
        email: "henaorangelmateo@gmail.com",
        name: "Mateo Henao",
        role: "USER"
      });
      console.log("Created user:", user);
    }
    
    console.log("Creating conversation...");
    const conversation = await db.orm.public.Conversation.create({
      title: "Test Conversation",
      userId: userId,
    });
    console.log("Conversation created:", conversation);
    
    console.log("Creating message...");
    const message = await db.orm.public.Message.create({
      conversationId: conversation.id,
      sender: "GEMINI",
      text: "Hello",
    });
    console.log("Message created:", message);
  } catch (err) {
    console.error("ERROR RUNNING PRISMA TEST:", err);
  }
}

test();
