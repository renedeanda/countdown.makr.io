
'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds, isToday } from 'date-fns';
import { FaBaby, FaBirthdayCake, FaGift, FaHeart, FaGraduationCap, FaPlane, FaRing, FaHome, FaCar, FaBriefcase, FaDumbbell, FaBook, FaMusic, FaTheaterMasks, FaSeedling, FaPaw, FaUserMd, FaGlassCheers, FaRunning, FaLaptopCode, FaPizzaSlice, FaPalette, FaGamepad, FaMoon, FaSun, FaSpaceShuttle, FaFootballBall, FaGuitar, FaMicrophone, FaChalkboardTeacher, FaCameraRetro } from 'react-icons/fa';
import { toPng } from 'html-to-image';
import { saveAs } from 'file-saver';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ReactGA from 'react-ga4';
import Confetti from 'react-confetti';
import Header from './Header';

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
  photoshoot: FaCameraRetro
};

const eventTypes = Object.keys(icons);

export default function Countdown() {
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ name: '', date: '', type: 'baby' });
  const [sortOrder, setSortOrder] = useState('ascending');
  const [holidays, setHolidays] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    const savedEvents = localStorage.getItem('events');
    if (savedEvents) {
      setEvents(JSON.parse(savedEvents));
    }
    fetchHolidays();
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get('https://date.nager.at/api/v3/PublicHolidays/2023/US');
      setHolidays(response.data);
    } catch (error) {
      console.error('Error fetching holidays:', error);
    }
  };

  const addEvent = useCallback(() => {
    if (newEvent.name && newEvent.date) {
      setEvents(prevEvents => [...prevEvents, { ...newEvent, id: Date.now().toString() }]);
      setNewEvent({ name: '', date: '', type: 'baby' });
      ReactGA.event({
        category: 'User',
        action: 'Added Event',
        label: newEvent.type
      });
    }
  }, [newEvent]);

  const shareImage = useCallback(async () => {
    const element = document.getElementById('countdown-share');
    if (element) {
      const blob = await toPng(element);
      saveAs(blob, 'countdown.png');
      ReactGA.event({
        category: 'User',
        action: 'Shared Image'
      });
    }
  }, []);

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
    return { days, hours, minutes, seconds };
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  const celebrate = () => {
    setIsCelebrating(true);
    setTimeout(() => setIsCelebrating(false), 5000);
  };

  return (
    <div className={`min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300`}>
      <Header toggleTheme={toggleTheme} isDarkMode={isDarkMode} onCelebrate={celebrate} />
      {isCelebrating && <Confetti />}
      <div className="container mx-auto p-4">
        <button onClick={sortEvents} className="mb-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition duration-300 ease-in-out transform hover:scale-105">
          Sort by Date ({sortOrder === 'ascending' ? 'Earliest First' : 'Latest First'})
        </button>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="events">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, index) => {
                  const IconComponent = icons[event.type];
                  const timeLeft = calculateTimeLeft(event.date);
                  const isEventToday = isToday(new Date(event.date));
                  return (
                    <Draggable key={event.id} draggableId={event.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 transition-transform duration-300 ease-in-out transform hover:scale-105"
                        >
                          {isEventToday && <Confetti />}
                          <div className="flex items-center justify-center mb-4">
                            <IconComponent className="text-5xl text-pink-500 dark:text-pink-400" />
                          </div>
                          <h2 className="text-xl font-semibold text-center mb-4 text-gray-800 dark:text-white">{event.name}</h2>
                          <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg p-2">
                              <span className="text-2xl font-bold text-white">{timeLeft.days}</span>
                              <p className="text-white text-sm">Days</p>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg p-2">
                              <span className="text-2xl font-bold text-white">{timeLeft.hours}</span>
                              <p className="text-white text-sm">Hours</p>
                            </div>
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg p-2">
                              <span className="text-2xl font-bold text-white">{timeLeft.minutes}</span>
                              <p className="text-white text-sm">Minutes</p>
                            </div>
                            <div className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg p-2">
                              <span className="text-2xl font-bold text-white">{timeLeft.seconds}</span>
                              <p className="text-white text-sm">Seconds</p>
                            </div>
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
        <button onClick={shareImage} className="mt-8 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full transition duration-300 ease-in-out transform hover:scale-105 text-lg font-semibold">
          Share as Image
        </button>
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add New Event</h3>
          <input
            type="text"
            placeholder="Event Name"
            value={newEvent.name}
            onChange={(e) => setNewEvent(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <input
            type="date"
            value={newEvent.date}
            onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
          <select
            value={newEvent.type}
            onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
            className="w-full p-2 mb-4 border rounded dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {eventTypes.map(type => (
              <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
            ))}
          </select>
          <button onClick={ad# Continuing from where we left off...

dEvent} className="w-full bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded transition duration-300 ease-in-out transform hover:scale-105">
            Add Event
          </button>
        </div>
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upcoming Holidays</h3>
          <ul className="space-y-2">
            {holidays.slice(0, 5).map(holiday => (
              <li key={holiday.date} className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold text-pink-500 dark:text-pink-400">{holiday.name}</span>: {holiday.date}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
