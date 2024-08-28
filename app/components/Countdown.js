'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, isToday, isPast, startOfDay } from 'date-fns';
import { FaBaby, FaBirthdayCake, FaGift, FaHeart, FaGraduationCap, FaPlane, FaRing, FaHome, FaCar, FaBriefcase, FaDumbbell, FaBook, FaMusic, FaTheaterMasks, FaSeedling, FaPaw, FaUserMd, FaGlassCheers, FaRunning, FaLaptopCode, FaPizzaSlice, FaPalette, FaGamepad, FaMoon, FaSun, FaSpaceShuttle, FaFootballBall, FaGuitar, FaMicrophone, FaChalkboardTeacher, FaCameraRetro, FaEdit, FaTrash, FaShare } from 'react-icons/fa';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactGA from 'react-ga4';
import Confetti from 'react-confetti';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ReactGA.initialize('YOUR_GA_MEASUREMENT_ID');

const icons = {
  baby: FaBaby,
  birthday: FaBirthdayCake,
  holiday: FaGift,
  anniversary: FaHeart,
  graduation: FaGraduationCap,
  vacation: FaPlane,
  wedding: FaRing,
  housewarming: FaHome,
  newcar: FaCar,
  retirement: FaBriefcase,
  fitnessgoal: FaDumbbell,
  booklaunch: FaBook,
  concert: FaMusic,
  theatershow: FaTheaterMasks,
  gardening: FaSeedling,
  petadoption: FaPaw,
  medicalmilestone: FaUserMd,
  newyear: FaGlassCheers,
  marathon: FaRunning,
  coding: FaLaptopCode,
  cookingchallenge: FaPizzaSlice,
  artexhibition: FaPalette,
  gamerelease: FaGamepad,
  eclipse: FaMoon,
  summersolstice: FaSun,
  spacelaunch: FaSpaceShuttle,
  sportsevent: FaFootballBall,
  musicalperformance: FaGuitar,
  podcast: FaMicrophone,
  workshop: FaChalkboardTeacher,
  photoshoot: FaCameraRetro,
};

const eventTypes = Object.keys(icons);

const gradients = [
  'from-blue-400 to-purple-500',
  'from-yellow-400 to-orange-500',
  'from-green-400 to-cyan-500',
  'from-pink-400 to-red-500',
  'from-indigo-400 to-blue-500'
];

export default function Countdown() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ name: '', date: new Date(), type: 'baby' });
  const [sortOrder, setSortOrder] = useState('ascending');
  const [holidays, setHolidays] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    fetchHolidays();
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      localStorage.setItem('events', JSON.stringify(events));
    }
  }, [events]);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get('https://date.nager.at/api/v3/PublicHolidays/2023/US');
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const addOrUpdateEvent = useCallback(() => {
    if (newEvent.name && newEvent.date) {
      if (editingEvent) {
        setEvents(prevEvents => prevEvents.map(event =>
          event.id === editingEvent.id ? { ...newEvent, id: event.id } : event
        ));
      } else {
        setEvents(prevEvents => [...prevEvents, { ...newEvent, id: Date.now().toString() }]);
      }
      setNewEvent({ name: '', date: new Date(), type: 'baby' });
      setEditingEvent(null);
      setIsModalOpen(false);
      ReactGA.event({
        category: 'User',
        action: editingEvent ? 'Updated Event' : 'Added Event',
        label: newEvent.type
      });
    }
  }, [newEvent, editingEvent]);

  const deleteEvent = useCallback((id) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== id));
    ReactGA.event({
      category: 'User',
      action: 'Deleted Event'
    });
  }, []);

  const shareEvent = useCallback(async (event) => {
    const element = document.getElementById(`event-${event.id}`);
    if (element) {
      try {
        const scale = 2; // Scale for better resolution
        const dataUrl = await toPng(element, {
          backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF',
          pixelRatio: scale,
          width: element.clientWidth, // Ensure width and height are equal
          height: element.clientWidth, // Use width for both to maintain square
        });
  
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d', { alpha: true });
  
          // Ensure canvas is square
          canvas.width = img.width;
          canvas.height = img.width; // Height equal to width for square
  
          // Draw background
          ctx.fillStyle = isDarkMode ? '#1F2937' : '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
  
          // Draw the image
          ctx.drawImage(img, 0, 0, img.width, img.height);
  
          ctx.font = '20px Arial';
          ctx.fillStyle = isDarkMode ? '#FFFFFF' : '#000000';
          ctx.textAlign = 'center';
          ctx.fillText('Made with countdown.makr.io 🎉', canvas.width / 2, canvas.height - 20);
  
          canvas.toBlob((blob) => {
            saveAs(blob, `${event.name}-countdown.png`, { quality: 0.92 });
          }, 'image/png');
        };
      } catch (error) {
        console.error('Error generating image:', error);
      }
  
      ReactGA.event({
        category: 'User',
        action: 'Shared Event',
      });
    }
  }, [isDarkMode]);

  const sortEvents = useCallback(() => {
    setEvents(prevEvents => {
      const sortedEvents = [...prevEvents].sort((a, b) => {
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        return sortOrder === 'ascending' ? timeA - timeB : timeB - timeA;
      });
      return sortedEvents;
    });
    setSortOrder(prevOrder => prevOrder === 'ascending' ? 'descending' : 'ascending');
  }, [sortOrder]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const items = Array.from(events);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setEvents(items);
  }, [events]);

  const calculateTimeLeft = useCallback((date) => {
    const now = new Date();
    const target = new Date(date);
    const days = differenceInDays(target, now);
    const hours = differenceInHours(target, now) % 24;
    const minutes = differenceInMinutes(target, now) % 60;
    const seconds = differenceInSeconds(target, now) % 60;
    return { days: Math.max(days, 0), hours: Math.max(hours, 0), minutes: Math.max(minutes, 0), seconds: Math.max(seconds, 0) };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const celebrate = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 5000);
  };

  const openModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setNewEvent(event);
    } else {
      setNewEvent({ name: '', date: new Date(), type: 'baby' });
      setEditingEvent(null);
    }
    setIsModalOpen(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-300`}>
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">Event Countdown</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={celebrate}
              className="bg-white text-purple-600 font-bold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105 hover:bg-purple-100"
            >
              Celebrate!
            </button>
            <button
              onClick={toggleTheme}
              className="text-white hover:text-yellow-300 transition duration-300 ease-in-out"
            >
              {isDarkMode ? <FaSun size={24} /> : <FaMoon size={24} />}
            </button>
          </div>
        </div>
      </header>
      {isCelebrating && <Confetti />}
      <main className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={sortEvents}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
          >
            Sort by Date ({sortOrder === 'ascending' ? 'Earliest First' : 'Latest First'})
          </button>
          <button
            onClick={() => openModal()}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-2 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Add New Event
          </button>
        </div>
        {events.length === 0 ? (
          <div className="text-center py-20">
            <FaGift className="text-6xl text-gray-400 mb-4 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No events yet</h2>
            <p className="text-gray-500 mb-8">Add your first event to start counting down!</p>
            <button
              onClick={() => openModal()}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Add Your First Event
            </button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="events">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event, index) => {
                    const IconComponent = icons[event.type];
                    const timeLeft = calculateTimeLeft(event.date);
                    const isEventToday = isToday(new Date(event.date));
                    const isPastEvent = isPast(new Date(event.date));
                    const gradientClass = gradients[index % gradients.length];
                    return (
                      <Draggable key={event.id} draggableId={event.id} index={index}>
                        {(provided) => (
                          <div className="flex flex-col">
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              id={`event-${event.id}`}
                              className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-transform duration-300 ease-in-out transform hover:scale-105 ${isEventToday ? 'ring-4 ring-yellow-400' : ''} flex flex-col items-center justify-center aspect-square`}
                            >
                              {isEventToday && <Confetti />}
                              <div className="flex flex-col items-center mb-4">
                                {IconComponent && <IconComponent className={'text-5xl mb-2 ${gradientClass} text-gray-400 dark:text-white'} />}
                                <h2 className="text-2xl font-semibold text-center mb-2 text-gray-800 dark:text-white">{event.name}</h2>
                              </div>
                              {isPastEvent ? (
                                <p className="text-center text-4xl font-bold text-gray-600 dark:text-gray-400">Event Passed</p>
                              ) : (
                                <>
                                  <p className={`text-center text-9xl font-bold bg-gradient-to-r ${gradientClass} text-transparent bg-clip-text`}>
                                    {timeLeft.days}
                                  </p>
                                  <p className="text-center text-xl text-gray-600 dark:text-gray-400 mt-2">Days Left</p>
                                </>
                              )}
                            </div>
                            <div className="flex justify-center space-x-2 mt-4">
                              <button onClick={() => openModal(event)} className="text-gray-500 dark:text-gray-400">
                                <FaEdit size={20} />
                              </button>
                              <button onClick={() => deleteEvent(event.id)} className="text-gray-500 dark:text-gray-400">
                                <FaTrash size={20} />
                              </button>
                              <button onClick={() => shareEvent(event)} className="text-gray-500 dark:text-gray-400">
                                <FaShare size={20} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </main>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  id="eventName"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event name"
                />
              </div>
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Date
                </label>
                <DatePicker
                  id="eventDate"
                  selected={new Date(newEvent.date)}
                  onChange={(date) => setNewEvent(prev => ({ ...prev, date }))}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  dateFormat="MMMM d, yyyy"
                  minDate={startOfDay(new Date())}
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    {
                      name: 'offset',
                      options: {
                        offset: [0, 8]
                      }
                    }
                  ]}
                />
              </div>
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Type
                </label>
                <select
                  id="eventType"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={addOrUpdateEvent}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {editingEvent ? 'Update Event' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}