import { useState, useEffect } from "react";
export const useDashboardLogic = () => {
    const [engineStarted, setEngineStarted] = useState(false);
    const [progress, setProgress] = useState(0); // Прогресс движения шкалы от 0 до 1
    const [mileage, setMileage] = useState(0.0); // Пробег автомобиля
    const initialValues = {
        fuelLevel: 0.56,
        temperature: 92,
        speed: 60,
        rpm: 2000,
        batteryLevel: 0.5,
        voltage: 12.0,
    };
    const maxValues = {
        fuelLevel: 1,
        temperature: 130,
        speed: 200,
        rpm: 8000,
        batteryLevel: 1,
        voltage: 14.4,
    };
    const calculateValues = (progress) => ({
        fuelLevel: maxValues.fuelLevel -
            (maxValues.fuelLevel - initialValues.fuelLevel) * progress,
        temperature: maxValues.temperature -
            (maxValues.temperature - initialValues.temperature) * progress,
        speed: maxValues.speed * (1 - progress),
        rpm: maxValues.rpm * (1 - progress),
        batteryLevel: maxValues.batteryLevel -
            (maxValues.batteryLevel - initialValues.batteryLevel) * progress,
        voltage: maxValues.voltage -
            (maxValues.voltage - initialValues.voltage) * progress,
    });
    useEffect(() => {
        if (engineStarted) {
            const duration = 1000;
            const steps = 60;
            const interval = duration / steps;
            let currentStep = 0;
            const timer = setInterval(() => {
                currentStep++;
                const newProgress = currentStep / steps;
                setProgress(newProgress);
                setMileage((prevMileage) => prevMileage + 0.01);
                if (currentStep >= steps) {
                    clearInterval(timer);
                }
            }, interval);
            return () => clearInterval(timer);
        }
    }, [engineStarted]);
    const currentValues = calculateValues(progress);
    return {
        engineStarted,
        setEngineStarted,
        currentValues,
        mileage,
    };
};
