const { Telegraf } = require('telegraf');
const { message } = require('telegraf/filters');

const {State, Queue, Command} = require('./state');

const state = new State();
const queue = new Queue();

const bot = new Telegraf("TOKEN");

const chatID = 1000;
const adminsID = [6589873790, 6463448650];

bot.start((ctx) => {
    ctx.reply("Howdy!");
});

bot.command("invite", (ctx) => {
    if(ctx.chat.id === chatID){ctx.reply("Пишите эту команду мне в ЛС."); return;}

    bot.telegram.getChatMember(chatID, ctx.from.id).then(
        (res) => {
            if(res.status){
                ctx.reply("Вы в группе. (ID: " + ctx.from.id + "), отправьте анкету.");
                state.setState(ctx, "awaiting_blank");
            }
            else{
                ctx.reply("Геть.");
            }
        }
    );
});

bot.command("approve", (ctx) => {
    if(!adminsID.includes(ctx.from.id)){ctx.reply("Не маловат ли ты для этой команды?"); return;}

    let id = parseInt(Command.getArg("/approve", ctx), 10);
    let result = queue.get(parseInt(id));
    id = result != undefined ? result.id : undefined;

    if(id != undefined){
        bot.telegram.createChatInviteLink(chatID, {
            member_limit: 1,
            expire_date: Math.floor((Date.now() / 1000) + (60 * 60))
        }).then((link) => {
            bot.telegram.sendMessage(id, `Вашу заявку одобрили, переходите по этой ссылке >${link.invite_link}<, она одноразовая и действует всего час.`);
        });
        queue.remove(id);
    }
    else{
        ctx.reply("Не удалось найти пользователя в очереди на одобрение...");
    }
});

bot.command("decline", (ctx) => {
    if(!adminsID.includes(ctx.from.id)){ctx.reply("Не маловат ли ты для этой команды?"); return;}

    let id = parseInt(Command.getArg("/decline", ctx));
    let result = queue.get(id);
    id = result != undefined ? result.id : undefined;

    if(id != undefined){
        queue.remove(id);
        ctx.reply(`${id} удален из очереди!`);
        bot.telegram.sendMessage(id, "Ваша заявка была отклонена!");
    }
    else{
        ctx.reply(`${id} не найден в очереди...`);
    }
});

bot.on(message(), (ctx) => {
    if(state.getState(ctx) == "awaiting_blank"){
        queue.add(ctx.from.id, ctx.message.text);

        ctx.reply("Анкета принята, ждите одобрения!");
        
        adminsID.forEach((adminID) => {bot.telegram.sendMessage(adminID, `Юзверь ${ctx.from.username} отправил анкету: \n ${ctx.message.text} \n Для одобрения \`/approve ${ctx.from.id}\` \n для отклонения \`/decline ${ctx.from.id}\``, {
            parse_mode: "Markdown"
        });});

        state.setState(ctx, "idle");
    }
});

bot.launch();
