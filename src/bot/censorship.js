'use strict';

import * as bot from "./reply.js";
import * as config from "../config/config.js"
const lang = new config.Language();

export function displayCensorList(message) {
    let listCensoredWords = "";
    let listApprovedWords = "";
    for (let i = 0; config.censored[i]; i++) {
        listCensoredWords += config.censored[i][0] + ",";
        listApprovedWords += config.censored[i][1] + ",";
    }
    listCensoredWords = listCensoredWords.substr(0, listCensoredWords.length - 1);
    listApprovedWords = listApprovedWords.substr(0, listApprovedWords.length - 1);
    let reply = `${config.strings[lang.countryCode].displayListPart01} ${listCensoredWords} ${config.strings[lang.countryCode].displayListPart02} ${listApprovedWords}`;
    bot.replyInChannel(reply, message);
}

export function addCensoredWord(message) {
    if (message.member === message.guild.owner) {
        let opts = message.content.split(/\s/);
        config.addCensoredWord(opts[1], opts[2], function(err) {
            if (err) {
                console.log(err);
                bot.replyInPM(config.strings[lang.countryCode].addCensoredWordKO, message);
            } else {
                bot.replyInPM(config.strings[lang.countryCode].addCensoredWordOK, message);
            }
        });
    } else {
        bot.replyInChannel(config.strings[lang.countryCode].badPermission, message);
    }
}

export function censor(message) {
    let content = message.content;
    for (let i = 0; config.censored[i]; i++) {
        let words = config.censored[i];
        let regexp = new RegExp(words[0], "gi");
        if (content.search(regexp) != -1) {
            content = content.replace(regexp, words[1]);
            content = `${config.strings[lang.countryCode].censorship} ${content}`;
            bot.replyWithAuthor(content, message);
            message.delete();
            return 0; 
        }
    }
    return 1;
}
