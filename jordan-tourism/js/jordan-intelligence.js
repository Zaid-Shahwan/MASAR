(function (window) {
    "use strict";

    var JordanAI = {};

    /* =========================
       TEXT NORMALIZATION
    ========================= */

    function normalize(text) {
        if (!text) {
            return "";
        }

        text = String(text).toLowerCase();

        // Arabic letter normalization
        text = text
            .replace(/[أإآ]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/ؤ/g, "و")
            .replace(/ئ/g, "ي");

        // Remove Arabic diacritics
        text = text.replace(/[\u064B-\u065F\u0670]/g, "");

        // Remove punctuation
        text = text.replace(/[.,!?؟،؛:()[\]{}"'`~@#$%^&*+=<>/\\|_-]/g, " ");

        // Normalize spaces
        text = text.replace(/\s+/g, " ").trim();

        return text;
    }


    /* =========================
       LANGUAGE DETECTION
    ========================= */

    function detectLanguage(text) {
        var arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
        var english = (text.match(/[A-Za-z]/g) || []).length;

        if (arabic > english) {
            return "ar";
        }

        if (english > arabic) {
            return "en";
        }

        return "ar";
    }


    /* =========================
       JORDAN PLACES
    ========================= */

    var places = [
        {
            name: "عمان",
            english: "Amman",
            aliases: ["عمان", "amman", "عمّان"]
        },
        {
            name: "الزرقاء",
            english: "Zarqa",
            aliases: ["الزرقاء", "زرقاء", "zarqa", "zarqa'a"]
        },
        {
            name: "اربد",
            english: "Irbid",
            aliases: ["اربد", "إربد", "irbid"]
        },
        {
            name: "العقبة",
            english: "Aqaba",
            aliases: ["العقبة", "عقبة", "aqaba"]
        },
        {
            name: "مادبا",
            english: "Madaba",
            aliases: ["مادبا", "مأدبا", "madaba"]
        },
        {
            name: "السلط",
            english: "Salt",
            aliases: ["السلط", "سلط", "as-salt", "salt"]
        },
        {
            name: "جرش",
            english: "Jerash",
            aliases: ["جرش", "jerash"]
        },
        {
            name: "عجلون",
            english: "Ajloun",
            aliases: ["عجلون", "ajloun"]
        },
        {
            name: "الكرك",
            english: "Karak",
            aliases: ["الكرك", "كرك", "karak"]
        },
        {
            name: "معان",
            english: "Ma'an",
            aliases: ["معان", "maan", "ma'an"]
        },
        {
            name: "الطفيلة",
            english: "Tafilah",
            aliases: ["الطفيلة", "طفيله", "tafilah"]
        },
        {
            name: "المفرق",
            english: "Mafraq",
            aliases: ["المفرق", "مفرق", "mafraq"]
        },
        {
            name: "البتراء",
            english: "Petra",
            aliases: ["البتراء", "بترا", "petra"]
        },
        {
            name: "وادي رم",
            english: "Wadi Rum",
            aliases: ["وادي رم", "وادي الروم", "wadi rum"]
        },
        {
            name: "البحر الميت",
            english: "Dead Sea",
            aliases: ["البحر الميت", "dead sea"]
        },
        {
            name: "ام قيس",
            english: "Umm Qais",
            aliases: ["ام قيس", "أم قيس", "umm qais"]
        },
        {
            name: "جبل نيبو",
            english: "Mount Nebo",
            aliases: ["جبل نيبو", "نيبو", "mount nebo"]
        },
        {
            name: "وادي الموجب",
            english: "Wadi Mujib",
            aliases: ["وادي الموجب", "الموجب", "wadi mujib"]
        },
        {
            name: "محمية ضانا",
            english: "Dana",
            aliases: ["ضانا", "محمية ضانا", "دانا", "dana"]
        },
        {
            name: "المغطس",
            english: "Baptism Site",
            aliases: ["المغطس", "موقع المغطس", "baptism site"]
        }
    ];


    /* =========================
       CATEGORIES
    ========================= */

    var categories = {
        restaurant: [
            "مطعم",
            "مطاعم",
            "restaurant",
            "restaurants",
            "اكل",
            "أكل",
            "food",
            "غدا",
            "غداء",
            "عشا",
            "عشاء"
        ],

        cafe: [
            "كافيه",
            "كافي",
            "قهوة",
            "كوفي",
            "cafe",
            "coffee",
            "coffee shop"
        ],

        hotel: [
            "فندق",
            "فنادق",
            "hotel",
            "hotels",
            "اقامة",
            "إقامة"
        ],

        tourism: [
            "سياحة",
            "سياحي",
            "سياحية",
            "tourism",
            "tourist"
        ],

        attraction: [
            "مكان سياحي",
            "اماكن سياحية",
            "أماكن سياحية",
            "معلم",
            "معالم",
            "attraction",
            "attractions"
        ],

        historical: [
            "تاريخ",
            "تاريخي",
            "تاريخية",
            "اثري",
            "أثري",
            "اثرية",
            "أثرية",
            "اثار",
            "آثار",
            "historical",
            "history",
            "archaeological"
        ],

        nature: [
            "طبيعة",
            "طبيعي",
            "طبيعية",
            "nature",
            "natural"
        ],

        shopping: [
            "تسوق",
            "سوق",
            "اسواق",
            "أسواق",
            "مول",
            "مولات",
            "shopping",
            "mall",
            "market"
        ],

        museum: [
            "متحف",
            "متاحف",
            "museum",
            "museums"
        ],

        park: [
            "حديقة",
            "حدائق",
            "park",
            "parks"
        ],

        beach: [
            "شاطئ",
            "شاطي",
            "بحر",
            "beach",
            "sea"
        ],

        transport: [
            "مواصلات",
            "باص",
            "باصات",
            "تاكسي",
            "تكسي",
            "نقل",
            "transport",
            "bus",
            "taxi"
        ],

        activity: [
            "نشاط",
            "نشاطات",
            "فعاليات",
            "فعالية",
            "activities",
            "activity",
            "things to do"
        ],

        family: [
            "عائلي",
            "عائلية",
            "عيلة",
            "اطفال",
            "أطفال",
            "kids",
            "family",
            "children"
        ],

        food: [
            "منسف",
            "فلافل",
            "حمص",
            "شاورما",
            "كنافة",
            "مقلوبة",
            "مأكولات",
            "اكلات",
            "أكلات",
            "jordanian food"
        ]
    };


    /* =========================
       KEYWORDS
    ========================= */

    var locationWords = [
        "قريب مني",
        "قريب",
        "حولي",
        "جنبي",
        "بالقرب مني",
        "اقرب",
        "أقرب",
        "near me",
        "nearby",
        "close to me",
        "closest",
        "nearest",
        "around me"
    ];

    var recommendationWords = [
        "تنصحني",
        "تنصح",
        "شو بتنصح",
        "شو تنصح",
        "اقترح",
        "اقتراح",
        "اقتراحات",
        "افضل",
        "أفضل",
        "منيح",
        "ممتاز",
        "حلو",
        "recommend",
        "recommendation",
        "suggest",
        "best",
        "good"
    ];

    var directionWords = [
        "كيف اروح",
        "كيف اروح",
        "وين الطريق",
        "طريق",
        "اتجاه",
        "وصل",
        "اوصل",
        "كيف اوصل",
        "directions",
        "direction",
        "how do i get"
    ];

    var distanceWords = [
        "كم بعيد",
        "كم تبعد",
        "كم المسافة",
        "مسافة",
        "بعيد",
        "distance",
        "how far"
    ];

    var hoursWords = [
        "متى بفتح",
        "متى يفتح",
        "متى بتفتح",
        "متى تسكر",
        "متى يغلق",
        "ساعات العمل",
        "دوام",
        "مفتوح",
        "open",
        "opening hours",
        "hours",
        "closed"
    ];

    var priceWords = [
        "كم السعر",
        "كم سعر",
        "السعر",
        "اسعار",
        "أسعار",
        "تكلفة",
        "بكم",
        "فلوس",
        "price",
        "prices",
        "cost",
        "how much"
    ];

    var tripWords = [
        "رحلة",
        "رحلتي",
        "برنامج",
        "جدول",
        "يوم واحد",
        "يومين",
        "ثلاث ايام",
        "اسبوع",
        "أسبوع",
        "سفرة",
        "سفر",
        "trip",
        "itinerary",
        "plan",
        "travel"
    ];


    /* =========================
       HELPER FUNCTIONS
    ========================= */

    function containsAny(text, words) {
        var i;

        for (i = 0; i < words.length; i++) {
            if (text.indexOf(normalize(words[i])) !== -1) {
                return true;
            }
        }

        return false;
    }


    function findCategory(text) {
        var normalized = normalize(text);
        var category;
        var list;
        var i;

        for (category in categories) {
            if (!categories.hasOwnProperty(category)) {
                continue;
            }

            list = categories[category];

            for (i = 0; i < list.length; i++) {
                if (normalized.indexOf(normalize(list[i])) !== -1) {
                    return category;
                }
            }
        }

        return null;
    }


    function findPlace(text) {
        var normalized = normalize(text);
        var i;
        var j;
        var place;

        for (i = 0; i < places.length; i++) {
            place = places[i];

            for (j = 0; j < place.aliases.length; j++) {
                if (normalized.indexOf(normalize(place.aliases[j])) !== -1) {
                    return place;
                }
            }
        }

        return null;
    }


    function containsLocationQuestion(text) {
        return containsAny(text, locationWords);
    }


    function containsRecommendation(text) {
        return containsAny(text, recommendationWords);
    }


    function containsDirections(text) {
        return containsAny(text, directionWords);
    }


    function containsDistance(text) {
        return containsAny(text, distanceWords);
    }


    function containsHours(text) {
        return containsAny(text, hoursWords);
    }


    function containsPrice(text) {
        return containsAny(text, priceWords);
    }


    function containsTrip(text) {
        return containsAny(text, tripWords);
    }


    /* =========================
       INTENT DETECTION
    ========================= */

    function detectIntent(text, category, place) {
        var normalized = normalize(text);

        if (containsLocationQuestion(normalized)) {
            if (category === "restaurant") {
                return "nearby_restaurant";
            }

            if (category === "cafe") {
                return "nearby_cafe";
            }

            if (category === "hotel") {
                return "nearby_hotel";
            }

            if (category) {
                return "nearby_" + category;
            }

            return "nearby_places";
        }

        if (containsDirections(normalized)) {
            return "directions";
        }

        if (containsDistance(normalized)) {
            return "distance";
        }

        if (containsHours(normalized)) {
            return "opening_hours";
        }

        if (containsPrice(normalized)) {
            return "price";
        }

        if (containsTrip(normalized)) {
            return "trip_planning";
        }

        if (containsRecommendation(normalized)) {
            if (category) {
                return "recommend_" + category;
            }

            return "recommendation";
        }

        if (place && category) {
            return "place_category_information";
        }

        if (place) {
            return "place_information";
        }

        if (category) {
            return category + "_information";
        }

        if (
            normalized.indexOf("الاردن") !== -1 ||
            normalized.indexOf("اردن") !== -1 ||
            normalized.indexOf("jordan") !== -1
        ) {
            return "jordan_information";
        }

        return "general_jordan_question";
    }


    /* =========================
       MAIN ANALYSIS
    ========================= */

    JordanAI.analyze = function (message) {
        var text = String(message || "");
        var normalized = normalize(text);
        var category = findCategory(normalized);
        var place = findPlace(normalized);
        var intent = detectIntent(normalized, category, place);

        return {
            original: text,
            normalized: normalized,
            language: detectLanguage(text),
            intent: intent,
            category: category,
            place: place,
            needsLocation: containsLocationQuestion(normalized),
            isRecommendation: containsRecommendation(normalized),
            isDirections: containsDirections(normalized),
            isDistance: containsDistance(normalized),
            isHoursQuestion: containsHours(normalized),
            isPriceQuestion: containsPrice(normalized),
            isTripPlanning: containsTrip(normalized)
        };
    };


    /* =========================
       JORDAN AI SYSTEM PROMPT
    ========================= */

    JordanAI.buildPrompt = function (message, context) {
        var analysis = JordanAI.analyze(message);
        var languageInstruction;
        var locationInstruction;
        var categoryInstruction;
        var placeInstruction;
        var contextInstruction;

        if (analysis.language === "ar") {
            languageInstruction =
                "Respond in natural Arabic. If the user writes Jordanian colloquial Arabic, understand it and reply naturally in clear Jordanian Arabic.";
        } else {
            languageInstruction =
                "Respond in natural English. If the user mixes Arabic and English, understand both.";
        }

        if (analysis.needsLocation) {
            locationInstruction =
                "This is a location-dependent question. Use the existing location/place-search functionality when available. Do not invent nearby businesses, distances, or coordinates.";
        } else {
            locationInstruction =
                "Do not request GPS/location unless the question actually requires a user's current location.";
        }

        if (analysis.category) {
            categoryInstruction =
                "Detected category: " + analysis.category + ".";
        } else {
            categoryInstruction =
                "No specific category was detected.";
        }

        if (analysis.place) {
            placeInstruction =
                "Detected Jordan place: " +
                analysis.place.name +
                " (" +
                analysis.place.english +
                ").";
        } else {
            placeInstruction =
                "No specific place was detected.";
        }

        contextInstruction = "";

        if (context) {
            contextInstruction =
                "Previous conversation context may be relevant. Keep continuity with the user's previous messages.";
        }

        return (
            "You are the Jordan-focused AI assistant for the MASAR tourism application.\n" +
            "Your knowledge and answers should be strongly focused on Jordan.\n" +
            "Understand Modern Standard Arabic, Jordanian Arabic, English, and mixed Arabic-English messages.\n" +
            "Understand spelling mistakes, informal wording, short questions, and different ways of asking the same thing.\n" +
            "You can help with Jordanian cities, governorates, tourism, historical sites, nature, restaurants, cafes, hotels, shopping, museums, parks, beaches, activities, transportation, food, culture, geography, trip planning, and places.\n" +
            "Never invent real businesses, opening hours, prices, distances, availability, or live information.\n" +
            "For nearby or location-dependent questions, rely on the application's real location/search tools when available.\n" +
            "For general Jordan questions, answer directly without requiring GPS.\n" +
            "If information may be current or change frequently, clearly distinguish known information from information that needs live verification.\n" +
            languageInstruction +
            "\n" +
            locationInstruction +
            "\n" +
            categoryInstruction +
            "\n" +
            placeInstruction +
            "\n" +
            contextInstruction
        );
    };


    /* =========================
       SIMPLE CONTEXT STORAGE
    ========================= */

    JordanAI.saveContext = function (message) {
        try {
            sessionStorage.setItem(
                "masar_jordan_ai_last_message",
                String(message || "")
            );
        } catch (error) {
            // Ignore storage errors.
        }
    };


    JordanAI.getContext = function () {
        try {
            return sessionStorage.getItem(
                "masar_jordan_ai_last_message"
            ) || "";
        } catch (error) {
            return "";
        }
    };


    JordanAI.prepare = function (message) {
        var context = JordanAI.getContext();
        var result = {
            analysis: JordanAI.analyze(message),
            prompt: JordanAI.buildPrompt(message, context)
        };

        JordanAI.saveContext(message);

        return result;
    };


    /* =========================
       GLOBAL EXPORT
    ========================= */

    window.MASAR_JORDAN_AI = JordanAI;

})(window);