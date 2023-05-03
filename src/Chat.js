import React, { useState, useEffect, useMemo } from 'react';
import { MDBListGroup, MDBListGroupItem, MDBInput, MDBBtn } from 'mdb-react-ui-kit';
import './Chat.css';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [members, setMembers] = useState([]);
  const [userColor, setUserColor] = useState(null);

  const randomName = () => {
    const adjectives = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green", "long", "late", "lingering", "bold", "little", "morning", "muddy", "old", "red", "rough", "still", "small", "sparkling", "throbbing", "shy", "wandering", "withered", "wild", "black", "young", "holy", "solitary", "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine", "polished", "ancient", "purple", "lively", "nameless"];
    const nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly", "feather", "grass", "haze", "mountain", "night", "pond", "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder", "violet", "water", "wildflower", "wave", "water", "resonance", "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper", "frog", "smoke", "star"];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const user = `${adjective.slice(0, 1).toUpperCase()}${adjective.slice(1)}${noun}`
    return user;
  }

  const randomColor = () => {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
  }

  const getInverseColor = (hexColor) => {
    const color = hexColor.slice(1);
    const r = 255 - parseInt(color.slice(0, 2), 16);
    const g = 255 - parseInt(color.slice(2, 4), 16);
    const b = 255 - parseInt(color.slice(4, 6), 16);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  useEffect(() => {
    setUsername(randomName());
    setUserColor(randomColor());
  }, []);

  const CLIENT_ID = '2sxe3EkxMn0uTqkz';
  const drone = useMemo(() => new window.Scaledrone(CLIENT_ID, {
    data: {
      name: username,
    },
  }), []);

  const handleMembers = (members) => {
    return setMembers(members);
  };

  useEffect(() => {
    drone.on('open', error => {
      if (error) {
          alert('Došlo je do pogreške, molim vas pokušajte ponovo!');
          console.error(error);
        }
    });

    const room = drone.subscribe('observable-room');

    room.on('open', (error) => {
      if (error) {
        alert('Došlo je do pogreške, molim vas pokušajte ponovo!');
        console.error(error);
        return;
      }
      console.log('Successfully joined room');
    });

    room.on('members', (members) => {
      handleMembers(members);
    });

    room.on('message', (message) => {
      const newMessage = {
        username: message.data.substr(0, message.data.indexOf(":")),
        text: message.data.substr(message.data.indexOf(":") + 1),
        data: message.data
      };
      if (newMessage.username !== username) {
        setMessages(prevMessages => [...prevMessages, newMessage]);
      }
    });

    drone.on('close', (event) => {
      alert('Connection was closed', event);
      console.log('Connection was closed', event);
    });

  }, [messages]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleMessageSubmit = (event) => {
    
    event.preventDefault();

    const newMessage = {
      username: username,
      text: message,
      data: `${username}: ${message}`
    };

    setMessages(messages => [...messages, newMessage]);
    setMessage('');

    drone.publish({
      room: 'observable-room',
      message: newMessage.data
    });

    drone.on('error', (error) => {
      alert('Nije uspjelo slanje poruke, molim vas pokušajte ponovo!')
      console.error('Error publishing message:', error);
    });
  };

  const renderMessages = () => {
    return ( messages.map((message, index) => {
      const messageClass = message.username === username ? 'user-message' : 'other-message';
      const textColor = getInverseColor(userColor);
      return (
        <MDBListGroupItem
          key={index}
          className={`message ${messageClass} text-${message.username === username ? 'end' : 'start'} mb-2 d-flex justify-content-${message.username === username ? "end" : "start"}`}
          style={{ backgroundColor: `${message.username === username ? userColor : getInverseColor(userColor)}`, color: `${message.username === username ? textColor : userColor}` }}
          >
        <div className={`d-flex flex-column justify-content-${message.username === username ? 'end' : 'start'}`}>
          <span className={`fw-bold text-black ${messageClass}`}>{message.username}:</span>
          <span className={`message ${messageClass} text-${message.username === username ? 'end' : 'start'}`}>{message.text}</span>
        </div>
      </MDBListGroupItem>
      );
    }));
  };

  const renderUsers = () => {
    return (members.map((member, index) => {
      return <MDBListGroupItem 
          key={index}
          className='d-flex align-items-center justify-content-center mt-1'>
            <span className="badge rounded-pill bg-secondary">{member.id}</span>
        </MDBListGroupItem>
    }))
  }

  return (
    <div className='container p-4 d-flex-column align-items-center'>
      <div className='chat-header d-flex align-items-center justify-content-center'>
        <h2 className='my-3 text-black'>Moj Chat App</h2>
      </div>
      <div className='chat-body mb-3 p-5 border border-dark border-3'>
        <MDBListGroup className='mb-3'>{renderMessages()}</MDBListGroup>
        <form onSubmit={handleMessageSubmit}>
          <div className='text-center'>
            <MDBInput className='mb-3 border border-3 border-primary'
              type='text'
              placeholder='Napišite poruku...'
              value={message}
              onChange={handleMessageChange}
              autoFocus={true}
              />
            <MDBBtn color='primary' type='submit'><i className='fas fa-envelope me-2'></i>Pošalji</MDBBtn>
          </div>
        </form>
      </div>
      <div className='chat-footer text-center text-black mt-3'>
        <p>Vaše korisničko ime je: <span className='text-white'>{username}</span></p>
        <p>Online korisnici: <MDBListGroup className='d-flex align-items-center justify-content-center'>{renderUsers()}</MDBListGroup></p>
      </div>
    </div>
  );
};