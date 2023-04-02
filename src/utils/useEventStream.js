import { useState, useEffect } from 'react';

export default function useEventStream(url, options) {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const eventSource = new EventSource(url, options);
        eventSource.onmessage = (event) => {
            const parsedEvent = JSON.parse(event.data);
            setEvents((prevEvents) => [...prevEvents, parsedEvent]);
        };
        eventSource.onerror = (error) => {
            console.error('Event stream error:', error);
        };
        return () => {
            eventSource.close();
        };
    }, [url, options]);

    return events;
}