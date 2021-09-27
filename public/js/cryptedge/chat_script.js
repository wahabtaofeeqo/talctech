$(document).ready(function () {
    const chatForm = document.getElementById("chat-form");
    const myId = document.getElementById("sender_id").value;
    const chatMessages = document.querySelector(".chat-content");
    const chatBox = document.getElementById("mychatbox");
    const socket = io();

    // joined emitting
    socket.emit("joined", myId);

    document.getElementById('chat_ending').scrollIntoView();

    // dsiplay my messages sent by me
    socket.on("my_message", message => {
        outputMySentMessage(message);
        // scroll down after every text
        document.getElementById('chat_ending').scrollIntoView();
    });

    // display messages sent to me
    socket.on("incoming_message", message => {
        outputMyRecievedMessage(message);
        // scroll down after every text
        document.getElementById('chat_ending').scrollIntoView();
    });

    // message submit
    chatForm.addEventListener("submit", e => {
        e.preventDefault();
        if (e.target.elements.msg.value.length > 0) {
            const msg = e.target.elements.msg.value;
            const senderId = e.target.elements.sender_id.value;
            const receiverId = e.target.elements.receiver_id.value;
            const propertyId = e.target.elements.property_id.value;
            const content = {
                msg: msg,
                senderId: senderId,
                propertyId: propertyId,
                receiverId: receiverId,
            }

            socket.emit("chatMessage", content);
            // clear input value
            e.target.elements.msg.value = "";
            // // focus on input
            e.target.elements.msg.focus();
        }

    });

    // Output messages to DOM
    function outputMySentMessage(message) {
        const div = document.createElement('div');
        div.classList.add("timeline-wrapper");
        div.classList.add("timeline-inverted");
        div.classList.add("timeline-wrapper-primary");
        div.innerHTML = `<div class="timeline-badge" style="background-color: #F1D79D;"></div>
        <div class="timeline-panel">
            <div class="timeline-body">
                <p>${message.text}</p>
            </div>
            <div class="timeline-footer d-flex align-items-center">
                <br>
                <span class="ml-auto font-weight-bold">${message.time}</span>
            </div>
        </div>`;
        document.querySelector(".chat-content").appendChild(div);
    }

    function outputMyRecievedMessage(message) {
        const div = document.createElement('div');
        div.classList.add("timeline-wrapper");
        div.classList.add("timeline-wrapper-secondary");
        div.innerHTML = `<div class="timeline-badge" style="background-color: #C17267;"></div>
        <div class="timeline-panel">
            <div class="timeline-body">
                <p>${message.text}</p>
            </div>
            <div class="timeline-footer d-flex align-items-center">
                <br>
                <span class="ml-auto font-weight-bold">${message.time}</span>
            </div>
        </div>`;
        document.querySelector(".chat-content").appendChild(div);
    }

});