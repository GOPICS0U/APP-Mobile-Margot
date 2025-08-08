import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Star, Gift, MessageCircle, Trophy, Home, Sparkles, Check, Camera, Calendar, Award, Settings, Volume2, VolumeX, Edit3, Save, RotateCcw, Trash2 } from 'lucide-react';

const RomanticGamesApp = () => {
    const [currentGame, setCurrentGame] = useState('menu');
    const [points, setPoints] = useState(0);
    const [level, setLevel] = useState(1);
    const [achievements, setAchievements] = useState([]);
    const [streak, setStreak] = useState(0);
    const [playerName, setPlayerName] = useState('Mon Amour');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [creativeGallery, setCreativeGallery] = useState([]);
    const [lastVisit, setLastVisit] = useState(new Date().toDateString());
    const [showSettings, setShowSettings] = useState(false);

    // Système de niveau corrigé
    const getNextLevelPoints = useCallback(() => level * 100, [level]);
    const progressToNext = useCallback(() => {
        const nextLevel = getNextLevelPoints();
        return Math.min(100, (points % nextLevel) / nextLevel * 100);
    }, [points, getNextLevelPoints]);

    // Vérifier montée de niveau (corrigé)
    useEffect(() => {
        const requiredPoints = getNextLevelPoints();
        if (points >= requiredPoints && points > 0 && requiredPoints <= points) {
            const newLevel = Math.floor(points / 100) + 1;
            if (newLevel > level) {
                setLevel(newLevel);
                addAchievement(`Niveau ${newLevel} atteint ! 🎉`);
                playSound('levelup');
            }
        }
    }, [points, level, getNextLevelPoints]);

    // Vérifier streak quotidien (corrigé)
    useEffect(() => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (today !== lastVisit) {
            if (lastVisit === yesterday) {
                setStreak(prev => prev + 1);
                addAchievement(`${streak + 1} jour${streak > 0 ? 's' : ''} consécutif${streak > 0 ? 's' : ''} ! 🔥`);
            } else if (lastVisit !== today) {
                setStreak(1);
                addAchievement(`Retour ! Streak remise à 1 jour 🌟`);
            }
            setLastVisit(today);
        }
    }, [lastVisit, streak]);

    const addAchievement = (text) => {
        const newAchievement = { id: Date.now(), text, timestamp: new Date() };
        setAchievements(prev => [newAchievement, ...prev.slice(0, 4)]);

        // Animation toast
        setTimeout(() => {
            setAchievements(prev => prev.filter(a => a.id !== newAchievement.id));
        }, 5000);
    };

    const playSound = (type) => {
        if (!soundEnabled) return;
        // Simulation sons avec emojis dans console
        const sounds = {
            flip: '🔄',
            match: '✨',
            nomatch: '❌',
            correct: '🎉',
            wrong: '😔',
            levelup: '🚀',
            message: '💌',
            save: '💾'
        };
        console.log(`🔊 ${sounds[type] || '🎵'} ${type}`);
    };

    // ================== JEU 1: MEMORY CORRIGÉ ==================
    const MemoryGame = () => {
        const [cards, setCards] = useState([]);
        const [flippedCards, setFlippedCards] = useState([]);
        const [matched, setMatched] = useState(new Set());
        const [moves, setMoves] = useState(0);
        const [gamePoints, setGamePoints] = useState(0);
        const [isProcessing, setIsProcessing] = useState(false);
        const [difficulty, setDifficulty] = useState('easy');
        const [gameStarted, setGameStarted] = useState(false);

        const difficulties = {
            easy: { pairs: 6, symbols: ['💖', '💕', '💗', '💘', '🌹', '🦋'] },
            medium: { pairs: 8, symbols: ['💖', '💕', '💗', '💘', '🌹', '🦋', '⭐', '🌙'] },
            hard: { pairs: 10, symbols: ['💖', '💕', '💗', '💘', '🌹', '🦋', '⭐', '🌙', '✨', '🦄'] }
        };

        const initializeGame = useCallback(() => {
            const symbols = difficulties[difficulty].symbols;
            const gameCards = [...symbols, ...symbols].map((symbol, index) => ({
                id: index,
                symbol,
                isFlipped: false,
                isMatched: false
            }));

            // Mélanger les cartes
            const shuffled = gameCards.sort(() => Math.random() - 0.5);

            setCards(shuffled);
            setFlippedCards([]);
            setMatched(new Set());
            setMoves(0);
            setGamePoints(0);
            setIsProcessing(false);
            setGameStarted(true);
        }, [difficulty]);

        useEffect(() => {
            initializeGame();
        }, [initializeGame]);

        const flipCard = useCallback((cardId) => {
            if (isProcessing || matched.has(cardId) || flippedCards.includes(cardId) || flippedCards.length >= 2) {
                return;
            }

            const newFlippedCards = [...flippedCards, cardId];
            setFlippedCards(newFlippedCards);
            playSound('flip');

            if (newFlippedCards.length === 2) {
                setIsProcessing(true);
                setMoves(prev => prev + 1);

                const [firstId, secondId] = newFlippedCards;
                const firstCard = cards.find(c => c.id === firstId);
                const secondCard = cards.find(c => c.id === secondId);

                setTimeout(() => {
                    if (firstCard.symbol === secondCard.symbol) {
                        setMatched(prev => new Set([...prev, firstId, secondId]));
                        const pointsEarned = difficulty === 'hard' ? 20 : difficulty === 'medium' ? 15 : 10;
                        setGamePoints(prev => prev + pointsEarned);
                        setPoints(prev => prev + pointsEarned);
                        playSound('match');
                    } else {
                        playSound('nomatch');
                    }

                    setFlippedCards([]);
                    setIsProcessing(false);
                }, 1200);
            }
        }, [isProcessing, matched, flippedCards, cards, difficulty, setPoints]);

        const isCardVisible = useCallback((cardId) => {
            return matched.has(cardId) || flippedCards.includes(cardId);
        }, [matched, flippedCards]);

        const isGameComplete = matched.size === difficulties[difficulty].pairs * 2;

        if (isGameComplete && gameStarted) {
            setTimeout(() => {
                addAchievement(`Memory terminé en ${moves} coups ! 🧠`);
            }, 500);
        }

        return (
            <div className="p-4">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-pink-600 mb-2">Memory d'Amour 💕</h2>

                    <div className="flex justify-center gap-2 mb-4">
                        {Object.keys(difficulties).map(diff => (
                            <button
                                key={diff}
                                onClick={() => setDifficulty(diff)}
                                disabled={isProcessing}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${difficulty === diff
                                    ? 'bg-pink-500 text-white shadow-lg'
                                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                                    } disabled:opacity-50`}
                            >
                                {diff === 'easy' ? 'Facile' : diff === 'medium' ? 'Moyen' : 'Difficile'}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between text-sm text-gray-600 mb-4 bg-white rounded-lg p-2 shadow-sm">
                        <span>Coups: <b>{moves}</b></span>
                        <span>Points: <b className="text-pink-600">{gamePoints}</b></span>
                        <span>Paires: <b>{matched.size / 2}/{difficulties[difficulty].pairs}</b></span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                            className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(matched.size / (difficulties[difficulty].pairs * 2)) * 100}%` }}
                        />
                    </div>
                </div>

                <div className={`grid gap-3 max-w-sm mx-auto ${difficulty === 'easy' ? 'grid-cols-3' :
                    difficulty === 'medium' ? 'grid-cols-4' : 'grid-cols-5'
                    }`}>
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            onClick={() => flipCard(card.id)}
                            className={`aspect-square rounded-xl flex items-center justify-center text-2xl cursor-pointer transition-all duration-300 transform shadow-lg ${isCardVisible(card.id)
                                ? matched.has(card.id)
                                    ? 'bg-gradient-to-br from-green-200 to-green-300 border-2 border-green-400 scale-95 shadow-inner'
                                    : 'bg-gradient-to-br from-pink-200 to-pink-300 scale-105 shadow-xl'
                                : 'bg-gradient-to-br from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 hover:scale-105 shadow-xl'
                                } ${isProcessing ? 'pointer-events-none' : ''} active:scale-95`}
                        >
                            <span className="drop-shadow-sm">
                                {isCardVisible(card.id) ? card.symbol : '💝'}
                            </span>
                        </div>
                    ))}
                </div>

                {isGameComplete && (
                    <div className="text-center mt-6 bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-xl shadow-lg border border-green-200">
                        <div className="text-6xl mb-3 animate-bounce">🎉</div>
                        <p className="text-green-700 font-bold text-xl mb-2">Bravo {playerName} !</p>
                        <p className="text-green-600 text-lg">+{gamePoints} points en {moves} coups</p>
                        <p className="text-sm text-green-500 mb-4">
                            {moves <= difficulties[difficulty].pairs + 2 ? "Performance exceptionnelle ! 🏆" :
                                moves <= difficulties[difficulty].pairs * 1.5 ? "Très bien joué ! ⭐" :
                                    "Bien joué ! 😊"}
                        </p>
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={initializeGame}
                                className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                            >
                                <RotateCcw size={16} /> Rejouer
                            </button>
                            <button
                                onClick={() => setCurrentGame('menu')}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                            >
                                <Home size={16} /> Menu
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ================== JEU 2: QUIZ AMÉLIORÉ ==================
    const LoveQuiz = () => {
        const [currentQ, setCurrentQ] = useState(0);
        const [score, setScore] = useState(0);
        const [showResult, setShowResult] = useState(false);
        const [selectedAnswer, setSelectedAnswer] = useState(null);
        const [showFeedback, setShowFeedback] = useState(false);
        const [timeLeft, setTimeLeft] = useState(15);
        const [quizMode, setQuizMode] = useState('romantic');
        const [isActive, setIsActive] = useState(true);

        const quizTypes = {
            romantic: [
                {
                    q: "Quelle est la couleur de l'amour ?",
                    options: ["Rouge", "Bleu", "Vert", "Jaune"],
                    correct: 0,
                    feedback: "Rouge comme ton cœur qui bat pour moi ❤️"
                },
                {
                    q: "Combien de cœurs as-tu volés ?",
                    options: ["Aucun", "Un seul", "Beaucoup", "Le mien ❤️"],
                    correct: 3,
                    feedback: "Tu as volé le mien pour toujours ! 💕"
                },
                {
                    q: "Qu'est-ce qui rend chaque jour spécial ?",
                    options: ["Le soleil", "Ton sourire", "La pluie", "Le café"],
                    correct: 1,
                    feedback: "Ton sourire illumine ma journée ☀️"
                },
                {
                    q: "Quel est mon plus beau trésor ?",
                    options: ["L'or", "Les diamants", "Toi", "Ma famille"],
                    correct: 2,
                    feedback: "Tu es mon plus précieux trésor 💎"
                },
                {
                    q: "À quoi je pense le matin en me réveillant ?",
                    options: ["Au café", "Au travail", "À toi", "Au petit-déjeuner"],
                    correct: 2,
                    feedback: "Tu es ma première pensée chaque matin 🌅"
                }
            ],
            fun: [
                {
                    q: "Si tu étais un animal, tu serais...",
                    options: ["Un chat", "Un papillon", "Un dauphin", "Une licorne"],
                    correct: 3,
                    feedback: "Magique et unique comme une licorne ! 🦄"
                },
                {
                    q: "Ton superpouvoir secret ?",
                    options: ["Voler", "Me faire sourire", "Lire les pensées", "Téléportation"],
                    correct: 1,
                    feedback: "Tu as le pouvoir de me rendre heureux ! ✨"
                },
                {
                    q: "Notre premier rendez-vous idéal ?",
                    options: ["Restaurant chic", "Pique-nique", "Cinéma", "Sous les étoiles"],
                    correct: 3,
                    feedback: "Romantique sous un ciel étoilé ! 🌟"
                },
                {
                    q: "Quelle serait notre chanson ?",
                    options: ["Une ballade", "Du jazz", "De la pop", "Le silence complice"],
                    correct: 3,
                    feedback: "Parfois les plus beaux moments sont silencieux 🎵"
                },
                {
                    q: "Notre destination de rêve ?",
                    options: ["Paris", "Tokyo", "Wherever you are", "Une île déserte"],
                    correct: 2,
                    feedback: "Avec toi, chaque endroit devient magique 🌍"
                }
            ]
        };

        const questions = quizTypes[quizMode];

        // Timer corrigé
        useEffect(() => {
            let intervalId;

            if (isActive && timeLeft > 0 && !showFeedback && !showResult && selectedAnswer === null) {
                intervalId = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            handleAnswer(-1); // Temps écoulé
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

            return () => {
                if (intervalId) clearInterval(intervalId);
            };
        }, [isActive, timeLeft, showFeedback, showResult, selectedAnswer]);

        const handleAnswer = useCallback((selected) => {
            if (selectedAnswer !== null || showFeedback) return;

            setIsActive(false);
            setSelectedAnswer(selected);
            setShowFeedback(true);

            if (selected === questions[currentQ].correct) {
                setScore(prev => prev + 1);
                const timeBonus = timeLeft > 10 ? 25 : timeLeft > 5 ? 20 : timeLeft > 0 ? 15 : 10;
                setPoints(prev => prev + timeBonus);
                playSound('correct');
            } else {
                playSound('wrong');
            }

            setTimeout(() => {
                if (currentQ < questions.length - 1) {
                    setCurrentQ(prev => prev + 1);
                    setSelectedAnswer(null);
                    setShowFeedback(false);
                    setTimeLeft(15);
                    setIsActive(true);
                } else {
                    setShowResult(true);
                    setIsActive(false);
                }
            }, 2500);
        }, [selectedAnswer, showFeedback, questions, currentQ, timeLeft, setPoints]);

        const resetQuiz = () => {
            setCurrentQ(0);
            setScore(0);
            setShowResult(false);
            setSelectedAnswer(null);
            setShowFeedback(false);
            setTimeLeft(15);
            setIsActive(true);
        };

        const switchMode = () => {
            setQuizMode(prev => prev === 'romantic' ? 'fun' : 'romantic');
            resetQuiz();
        };

        if (showResult) {
            const percentage = (score / questions.length) * 100;
            const bonusPoints = Math.floor(percentage / 10) * 5;

            useEffect(() => {
                if (bonusPoints > 0) {
                    setPoints(prev => prev + bonusPoints);
                    addAchievement(`Quiz ${quizMode} terminé ! +${bonusPoints} pts bonus 🎯`);
                }
            }, [bonusPoints, quizMode]);

            return (
                <div className="p-4 text-center">
                    <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-4 shadow-lg">
                        <h2 className="text-2xl font-bold text-pink-600 mb-4">Quiz terminé ! 🎯</h2>
                        <div className="text-6xl mb-4 animate-pulse">
                            {percentage === 100 ? "🏆" : percentage >= 80 ? "🎉" : percentage >= 60 ? "😊" : percentage >= 40 ? "💕" : "💖"}
                        </div>
                        <p className="text-lg mb-2">Score: <span className="font-bold text-pink-600">{score}/{questions.length}</span> ({Math.round(percentage)}%)</p>
                        {bonusPoints > 0 && <p className="text-green-600 text-sm mb-2">+{bonusPoints} points bonus !</p>}
                        <p className="text-pink-600 text-lg font-medium bg-white rounded-lg p-3 shadow-sm">
                            {percentage === 100 ? `Parfait ${playerName} ! Tu me connais par cœur ❤️` :
                                percentage >= 80 ? `Excellent ${playerName} ! Je t'aime fort 💕` :
                                    percentage >= 60 ? `Pas mal ${playerName} ! On se découvre encore 😊` :
                                        percentage >= 40 ? `C'est mignon ${playerName}, on apprend ensemble ! 💕` :
                                            `C'est pas grave ${playerName}, l'amour ça s'apprend ! 💖`}
                        </p>
                    </div>

                    <div className="flex gap-2 justify-center flex-wrap">
                        <button
                            onClick={resetQuiz}
                            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
                        >
                            <RotateCcw size={16} /> Rejouer
                        </button>
                        <button
                            onClick={switchMode}
                            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            Mode {quizMode === 'romantic' ? 'Fun' : 'Romantique'}
                        </button>
                        <button
                            onClick={() => setCurrentGame('menu')}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                            <Home size={16} /> Menu
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4">
                <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-pink-600 mb-2">
                        Quiz {quizMode === 'romantic' ? 'Romantique' : 'Fun'} 💕
                    </h2>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                        <span>Question <b>{currentQ + 1}</b>/<b>{questions.length}</b></span>
                        <div className={`px-3 py-1 rounded-full font-bold transition-all ${timeLeft <= 3 ? 'bg-red-100 text-red-600 animate-pulse' :
                            timeLeft <= 7 ? 'bg-orange-100 text-orange-600' :
                                'bg-green-100 text-green-600'
                            }`}>
                            ⏱️ {timeLeft}s
                        </div>
                        <span>Score: <b className="text-pink-600">{score}</b></span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div
                            className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-linear"
                            style={{ width: `${(timeLeft / 15) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl mb-4 shadow-inner">
                    <p className="text-lg font-medium text-center leading-relaxed">{questions[currentQ].q}</p>
                </div>

                <div className="space-y-3 mb-4">
                    {questions[currentQ].options.map((option, index) => {
                        let buttonClass = "w-full p-4 text-left border-2 rounded-xl transition-all transform font-medium ";

                        if (showFeedback) {
                            if (index === questions[currentQ].correct) {
                                buttonClass += "bg-green-100 border-green-300 text-green-700 scale-105 shadow-lg";
                            } else if (index === selectedAnswer && index !== questions[currentQ].correct) {
                                buttonClass += "bg-red-100 border-red-300 text-red-700 scale-95";
                            } else {
                                buttonClass += "bg-gray-100 border-gray-300 text-gray-500";
                            }
                        } else if (selectedAnswer !== null) {
                            buttonClass += "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed";
                        } else {
                            buttonClass += "bg-white border-pink-200 hover:bg-pink-50 hover:border-pink-300 hover:scale-105 hover:shadow-lg cursor-pointer";
                        }

                        return (
                            <button
                                key={index}
                                onClick={() => handleAnswer(index)}
                                disabled={selectedAnswer !== null}
                                className={buttonClass + " active:scale-95"}
                            >
                                <span className="flex items-center">
                                    <span className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 text-sm font-bold flex items-center justify-center mr-3">
                                        {String.fromCharCode(65 + index)}
                                    </span>
                                    {option}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {showFeedback && (
                    <div className="text-center bg-purple-50 p-4 rounded-xl shadow-inner border border-purple-200">
                        <div className="text-2xl mb-2">
                            {selectedAnswer === questions[currentQ].correct ? "🎉" : "💕"}
                        </div>
                        <p className="text-purple-700 italic font-medium">"{questions[currentQ].feedback}"</p>
                    </div>
                )}
            </div>
        );
    };

    // ================== JEU 3: MESSAGES PERSONNALISÉS AMÉLIORÉ ==================
    const LoveMessages = () => {
        const [currentMsg, setCurrentMsg] = useState(0);
        const [customMessage, setCustomMessage] = useState('');
        const [savedMessages, setSavedMessages] = useState([]);
        const [showCustom, setShowCustom] = useState(false);
        const [favoriteMessages, setFavoriteMessages] = useState(new Set());
        const [messageCategory, setMessageCategory] = useState('morning');

        const getTimeBasedGreeting = () => {
            const hour = new Date().getHours();
            if (hour < 12) return 'Bonjour';
            if (hour < 17) return 'Bon après-midi';
            return 'Bonsoir';
        };

        const messageCategories = {
            morning: [
                `${getTimeBasedGreeting()} ${playerName} ☀️ Tu illumines mes journées comme un soleil`,
                `Réveille-toi ma beauté, une nouvelle journée d'amour nous attend 🌅`,
                `Ton sourire au réveil est ma dose quotidienne de bonheur 😊`,
                `Chaque matin avec toi est un nouveau conte de fées 🦋`,
            ],
            romantic: [
                `Chaque moment avec toi est précieux comme un diamant 💎`,
                `Ton sourire est ma mélodie préférée 🎵`,
                `Tu es ma plus belle aventure ${playerName} 🌟`,
                `Avec toi, tout devient magique ✨`,
                `Tu es mon bonheur quotidien 🌈`,
                `Mon cœur bat pour toi à chaque seconde 💓`,
                `Dans tes bras, je me sens chez moi 🏠`,
            ],
            evening: [
                `Bonne nuit ${playerName}, fais de beaux rêves de nous 🌙`,
                `Les étoiles sont jolies, mais elles ne t'arrivent pas à la cheville ⭐`,
                `Que cette nuit t'apporte de doux rêves d'amour 😴`,
                `Dors bien ma princesse, je veille sur tes songes 👑`,
            ],
            funny: [
                `Tu es mon WiFi : sans toi, je n'ai plus de connexion ! 📶`,
                `Si l'amour était un crime, on aurait la prison à vie ! 👮‍♀️`,
                `Tu es comme un bon café : tu me réveilles et me donnes de l'énergie ☕`,
                `Notre amour est comme un bon vin, il se bonifie avec le temps 🍷`,
            ]
        };

        const allMessages = [...(messageCategories[messageCategory] || []), ...savedMessages];

        const addCustomMessage = () => {
            if (customMessage.trim() && customMessage.length >= 5) {
                const newMessage = customMessage.trim();
                setSavedMessages(prev => [newMessage, ...prev]);
                setCustomMessage('');
                setPoints(prev => prev + 10);
                playSound('message');
                addAchievement('Message personnalisé créé ! +10 pts 📝');
            }
        };

        const toggleFavorite = (index) => {
            setFavoriteMessages(prev => {
                const newFavorites = new Set(prev);
                if (newFavorites.has(index)) {
                    newFavorites.delete(index);
                } else {
                    newFavorites.add(index);
                    setPoints(p => p + 2);
                }
                return newFavorites;
            });
        };

        const shareMessage = () => {
            const message = allMessages[currentMsg] || messageCategories.romantic[0];
            if (navigator.share) {
                navigator.share({
                    title: 'Message d\'amour',
                    text: message
                });
            } else {
                navigator.clipboard?.writeText(message);
                addAchievement('Message copié dans le presse-papiers ! 📋');
            }
        };

        return (
            <div className="p-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-pink-600 mb-2">Messages d'Amour 💌</h2>
                    <p className="text-sm text-gray-600">Messages spéciaux pour {playerName}</p>

                    <div className="flex justify-center gap-2 mt-4 flex-wrap">
                        {Object.keys(messageCategories).map(category => (
                            <button
                                key={category}
                                onClick={() => {
                                    setMessageCategory(category);
                                    setCurrentMsg(0);
                                }}
                                className={`px-3 py-1 rounded-full text-xs transition-all ${messageCategory === category
                                    ? 'bg-pink-500 text-white shadow-lg'
                                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                                    }`}
                            >
                                {category === 'morning' ? '🌅 Matin' :
                                    category === 'romantic' ? '💕 Romantique' :
                                        category === 'evening' ? '🌙 Soir' :
                                            '😄 Drôle'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-pink-100 to-purple-100 p-6 rounded-xl mb-6 min-h-[160px] flex flex-col justify-center shadow-lg relative">
                    <button
                        onClick={() => toggleFavorite(currentMsg)}
                        className={`absolute top-3 right-3 text-2xl transition-transform hover:scale-110 ${favoriteMessages.has(currentMsg) ? 'text-red-500' : 'text-gray-300 hover:text-red-400'
                            }`}
                    >
                        {favoriteMessages.has(currentMsg) ? '❤️' : '🤍'}
                    </button>

                    <p className="text-lg text-gray-800 italic text-center leading-relaxed font-medium">
                        "{allMessages[currentMsg] || messageCategories.romantic[0]}"
                    </p>

                    <div className="flex justify-center mt-4 gap-2">
                        <button
                            onClick={shareMessage}
                            className="bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors text-sm flex items-center gap-1"
                        >
                            📤 Partager
                        </button>
                    </div>
                </div>

                <div className="flex gap-2 justify-center mb-4">
                    <button
                        onClick={() => setCurrentMsg((currentMsg - 1 + allMessages.length) % allMessages.length)}
                        className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        ← Précédent
                    </button>
                    <button
                        onClick={() => setCurrentMsg((currentMsg + 1) % allMessages.length)}
                        className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Suivant →
                    </button>
                </div>

                <div className="text-center mb-4">
                    <button
                        onClick={() => setShowCustom(!showCustom)}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"
                    >
                        <Edit3 size={16} /> Créer mon message
                    </button>
                </div>

                {showCustom && (
                    <div className="bg-white p-4 rounded-xl border-2 border-pink-200 mb-4 shadow-sm">
                        <textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder="Écris ton propre message d'amour personnalisé..."
                            className="w-full p-3 border border-pink-300 rounded-lg resize-none h-24 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                            maxLength={200}
                        />
                        <div className="flex justify-between items-center mt-3">
                            <span className={`text-xs ${customMessage.length < 5 ? 'text-red-500' : 'text-gray-500'}`}>
                                {customMessage.length}/200 {customMessage.length < 5 ? '(min. 5 caractères)' : ''}
                            </span>
                            <button
                                onClick={addCustomMessage}
                                disabled={!customMessage.trim() || customMessage.length < 5}
                                className="bg-pink-500 text-white px-4 py-1 rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm transition-colors flex items-center gap-1"
                            >
                                <Save size={14} /> Ajouter (+10 pts)
                            </button>
                        </div>
                    </div>
                )}

                <div className="text-center bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-sm text-gray-600">
                        Message {currentMsg + 1}/{allMessages.length}
                        {savedMessages.length > 0 && (
                            <span className="text-pink-500 font-medium">
                                {' • '}{savedMessages.length} personnalisé{savedMessages.length > 1 ? 's' : ''}
                            </span>
                        )}
                        {favoriteMessages.size > 0 && (
                            <span className="text-red-500 font-medium">
                                {' • '}{favoriteMessages.size} favoris ❤️
                            </span>
                        )}
                    </p>
                </div>
            </div>
        );
    };

    // ================== JEU 4: STUDIO CRÉATIF AMÉLIORÉ ==================
    const CreativeStudio = () => {
        const [canvasElements, setCanvasElements] = useState([]);
        const [draggedElement, setDraggedElement] = useState(null);
        const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
        const [selectedTool, setSelectedTool] = useState('emoji');
        const [selectedColor, setSelectedColor] = useState('#FF69B4');
        const [brushSize, setBrushSize] = useState(32);
        const [showGallery, setShowGallery] = useState(false);
        const canvasRef = useRef(null);

        const emojis = [
            '💖', '💕', '💗', '💘', '🌹', '🦋', '⭐', '🌙',
            '☀️', '🌈', '✨', '🎀', '💎', '🔥', '🌟', '💫',
            '🦄', '👑', '🌺', '🌸', '🌼', '🌻', '💐', '🎁',
            '🍓', '🍑', '🥰', '😘', '😍', '🤗', '💋', '👄',
            '💌', '🎵', '🎶', '🎈', '🎉', '🎊', '🎭', '🎨',
            '🌊', '🏔️', '🌴', '🌷', '🌹', '🥀', '🌿', '☘️'
        ];

        const colors = [
            '#FF69B4', '#FF1493', '#DC143C', '#B22222',
            '#FF6347', '#FF8C00', '#FFD700', '#ADFF2F',
            '#00CED1', '#1E90FF', '#9370DB', '#BA55D3',
            '#FF69B4', '#FFF0F5', '#FFEBCD', '#F0E68C'
        ];

        const addElement = useCallback((content, type = 'emoji') => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();
            const newElement = {
                id: Date.now() + Math.random(),
                type,
                content,
                x: Math.random() * (rect.width - 100) + 50,
                y: Math.random() * (rect.height - 100) + 50,
                size: type === 'emoji' ? brushSize : 16,
                color: type === 'text' ? selectedColor : 'inherit',
                rotation: 0
            };

            setCanvasElements(prev => [...prev, newElement]);
            playSound('flip');
        }, [brushSize, selectedColor]);

        const addText = () => {
            const text = prompt('Écris ton texte d\'amour :');
            if (text && text.trim()) {
                addElement(text.trim(), 'text');
            }
        };

        const handleMouseDown = useCallback((e, element) => {
            e.preventDefault();
            const rect = e.currentTarget.getBoundingClientRect();
            const canvas = canvasRef.current.getBoundingClientRect();

            setDraggedElement(element.id);
            setDragOffset({
                x: e.clientX - canvas.left - element.x,
                y: e.clientY - canvas.top - element.y
            });
        }, []);

        const handleMouseMove = useCallback((e) => {
            if (!draggedElement) return;

            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();

            const newX = Math.max(0, Math.min(rect.width - 60, e.clientX - rect.left - dragOffset.x));
            const newY = Math.max(0, Math.min(rect.height - 60, e.clientY - rect.top - dragOffset.y));

            setCanvasElements(prev => prev.map(el =>
                el.id === draggedElement
                    ? { ...el, x: newX, y: newY }
                    : el
            ));
        }, [draggedElement, dragOffset]);

        const handleMouseUp = useCallback(() => {
            setDraggedElement(null);
        }, []);

        const rotateElement = (id) => {
            setCanvasElements(prev => prev.map(el =>
                el.id === id ? { ...el, rotation: (el.rotation + 45) % 360 } : el
            ));
        };

        const resizeElement = (id, delta) => {
            setCanvasElements(prev => prev.map(el =>
                el.id === id
                    ? { ...el, size: Math.max(16, Math.min(48, el.size + delta)) }
                    : el
            ));
        };

        const saveCreation = () => {
            if (canvasElements.length === 0) {
                addAchievement('Ajoute des éléments avant de sauvegarder ! 🎨');
                return;
            }

            const creation = {
                id: Date.now(),
                elements: [...canvasElements],
                timestamp: new Date(),
                title: `Création du ${new Date().toLocaleDateString()}`,
                elementCount: canvasElements.length
            };

            setCreativeGallery(prev => [creation, ...prev.slice(0, 9)]);
            const pointsEarned = Math.min(100, canvasElements.length * 5 + 20);
            setPoints(prev => prev + pointsEarned);
            playSound('save');
            addAchievement(`Création sauvegardée ! +${pointsEarned} pts 🎨`);
        };

        const clearCanvas = () => {
            if (canvasElements.length > 0 && confirm('Vider le canvas ? Cette action est irréversible.')) {
                setCanvasElements([]);
                playSound('nomatch');
            }
        };

        const removeElement = (id) => {
            setCanvasElements(prev => prev.filter(el => el.id !== id));
            playSound('flip');
        };

        const loadCreation = (creation) => {
            setCanvasElements(creation.elements);
            setShowGallery(false);
            addAchievement('Création chargée ! ✨');
        };

        return (
            <div className="p-4">
                <h2 className="text-2xl font-bold text-pink-600 mb-4 text-center">Studio de Création 🎨</h2>

                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                    <button
                        onClick={() => setSelectedTool('emoji')}
                        className={`px-3 py-2 rounded-lg transition-all flex items-center gap-1 ${selectedTool === 'emoji' ? 'bg-pink-500 text-white shadow-lg' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'
                            }`}
                    >
                        😊 Émojis
                    </button>
                    <button
                        onClick={addText}
                        className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-all flex items-center gap-1"
                    >
                        <Edit3 size={16} /> Texte
                    </button>
                    <button
                        onClick={() => setShowGallery(!showGallery)}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-all flex items-center gap-1"
                    >
                        🖼️ Galerie ({creativeGallery.length})
                    </button>
                </div>

                {selectedTool === 'emoji' && (
                    <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2 justify-center">
                            <label className="text-sm font-medium text-gray-600">Taille:</label>
                            <input
                                type="range"
                                min="16"
                                max="48"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="w-20"
                            />
                            <span className="text-sm text-gray-500">{brushSize}px</span>
                        </div>
                    </div>
                )}

                <div
                    ref={canvasRef}
                    className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 rounded-xl mb-4 h-80 border-2 border-pink-200 overflow-hidden shadow-inner"
                    style={{ touchAction: 'none' }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {canvasElements.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-gray-400 text-lg mb-2">Canvas créatif vide</p>
                                <p className="text-gray-300 text-sm">
                                    Choisis des emojis ci-dessous ou ajoute du texte<br />
                                    <span className="text-xs">Glisse • Redimensionne • Fais tourner</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {canvasElements.map((element) => (
                        <div
                            key={element.id}
                            className={`absolute cursor-move select-none transition-all duration-200 group ${draggedElement === element.id ? 'scale-110 z-20 shadow-lg' : 'hover:scale-105'
                                }`}
                            style={{
                                left: `${element.x}px`,
                                top: `${element.y}px`,
                                fontSize: `${element.size}px`,
                                color: element.color || 'inherit',
                                transform: `rotate(${element.rotation || 0}deg)`,
                                filter: draggedElement === element.id ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                            }}
                            onMouseDown={(e) => handleMouseDown(e, element)}
                            title="Glisse-moi ! Boutons pour plus d'options"
                        >
                            {element.content}

                            <div className="absolute -top-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-75 rounded-lg px-2 py-1 flex gap-1 text-white text-xs z-30">
                                <button
                                    onClick={(e) => { e.stopPropagation(); rotateElement(element.id); }}
                                    className="hover:bg-white hover:bg-opacity-20 px-1 rounded"
                                    title="Faire tourner"
                                >
                                    🔄
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); resizeElement(element.id, 4); }}
                                    className="hover:bg-white hover:bg-opacity-20 px-1 rounded"
                                    title="Agrandir"
                                >
                                    ➕
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); resizeElement(element.id, -4); }}
                                    className="hover:bg-white hover:bg-opacity-20 px-1 rounded"
                                    title="Rétrécir"
                                >
                                    ➖
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                                    className="hover:bg-red-500 px-1 rounded"
                                    title="Supprimer"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedTool === 'emoji' && (
                    <div className="grid grid-cols-8 gap-2 mb-4 max-h-40 overflow-y-auto bg-white rounded-lg p-3 border shadow-sm">
                        {emojis.map((emoji, index) => (
                            <button
                                key={index}
                                onClick={() => addElement(emoji)}
                                className="text-2xl p-2 rounded-lg hover:bg-pink-100 transition-all transform hover:scale-110 active:scale-95 border border-transparent hover:border-pink-200"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {selectedTool === 'text' && (
                    <div className="mb-4 bg-white rounded-lg p-3 border shadow-sm">
                        <div className="flex items-center gap-2 justify-center flex-wrap">
                            <label className="text-sm font-medium text-gray-600">Couleur:</label>
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-6 h-6 rounded-full border-2 transition-all ${selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300 hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                    <button
                        onClick={clearCanvas}
                        className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Vider
                    </button>

                    <button
                        onClick={saveCreation}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                    >
                        <Save size={16} /> Sauvegarder
                    </button>
                </div>

                <div className="text-center text-sm text-gray-600 bg-white rounded-lg p-2 shadow-sm">
                    {canvasElements.length} élément{canvasElements.length !== 1 ? 's' : ''} sur le canvas
                    {canvasElements.length > 0 && (
                        <span className="text-pink-600 font-medium ml-2">
                            • Prêt à sauvegarder !
                        </span>
                    )}
                </div>

                {showGallery && creativeGallery.length > 0 && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-96 overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-pink-600">🖼️ Galerie</h3>
                                <button
                                    onClick={() => setShowGallery(false)}
                                    className="text-gray-500 hover:text-gray-700 text-xl"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="space-y-3">
                                {creativeGallery.map((creation) => (
                                    <div
                                        key={creation.id}
                                        className="border rounded-lg p-3 hover:bg-pink-50 transition-colors cursor-pointer"
                                        onClick={() => loadCreation(creation)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sm">{creation.title}</p>
                                                <p className="text-xs text-gray-500">
                                                    {creation.elementCount} éléments • {creation.timestamp.toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <button className="text-pink-500 hover:text-pink-600 text-sm">
                                                    Charger →
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // ================ RENDU FINAL ================

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
            {currentGame === 'quiz' && <QuizGame />}
            {currentGame === 'messages' && <LoveMessages />}
            {currentGame === 'creative' && <CreativeStudio />}
            {currentGame === 'menu' && (
                <div className="p-6 text-center">
                    <h1 className="text-3xl font-bold text-pink-600 mb-6">Bienvenue dans RomanticGamesApp 💖</h1>
                    <div className="flex flex-col gap-4 max-w-sm mx-auto">
                        <button
                            onClick={() => setCurrentGame('quiz')}
                            className="bg-pink-500 text-white py-3 rounded-xl hover:bg-pink-600 transition-all text-lg"
                        >
                            🎯 Quiz Romantique
                        </button>
                        <button
                            onClick={() => setCurrentGame('messages')}
                            className="bg-purple-500 text-white py-3 rounded-xl hover:bg-purple-600 transition-all text-lg"
                        >
                            💌 Messages d'Amour
                        </button>
                        <button
                            onClick={() => setCurrentGame('creative')}
                            className="bg-yellow-500 text-white py-3 rounded-xl hover:bg-yellow-600 transition-all text-lg"
                        >
                            🎨 Studio Créatif
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RomanticGamesApp;
