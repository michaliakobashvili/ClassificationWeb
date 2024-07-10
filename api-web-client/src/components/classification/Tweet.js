import React from 'react';
import './Tweet.css';

// List of sentences/words to be bolded
const wordsToBold = ["لقد أعذر من أنذر", "بانفجار كبير", "انفجار كبير", "سلسلة من الانفجارات", "غضب الأقصى سينفجر", "سيفجر المنطقة", "انفجار الأوضاع", "تفجير الأوضاع", "سيفجر بركاناً من الغضب", "بركانا سيحرق", "صاعق التفجير", "انفجار مبكرًا", "فتيل الانفجار قصير", "بداية المعركة", "عواقب في المنطقة", "لدفع الروح والدم فداء لمسجدهم المقدس", "وقود نار سيحرقه", "آتون بطوفان هادر", "يلعب بالنار", "بإشعال المنطقة", "إشعال المنطقة", "سنحرق الأرض تحت أقدامهم", "نحرق الأرض", "حرب دينية", "تنقل هذه النيران إلى عمق كيان الاحتلال", "حقل ألغام", "سيأجج الأوضاع", "نار تتصاعد", "اعلان حرب", "الهولوكوست", "هولوكوست", "سيناريوهات التصعيد", "نضرب بقبضة واحدة", "طريق الرشاش", "تجاوز الخطوط الحمراء", "الخطوط الحمراء", "المقاومة لن تسمح بتجاوز الخطوط الحمراء في المسجد الأقصى", "ضرب هذا العدو المتغطرس بيد من حديد", "ضرب بيد من حديد", "بالدم والرصاص والسلاح.", "سيدفع العدو ثمنه غاليًا", "مواجهة اضطرارية", "الالتحام قريباً", "الأقصى ليس وحيداً ودونه الدماء والأرواح", "رد بكل قوة وبكل الأدوات", "لمواجهة المخططات الصهيونية", "التصدي لاعتداءات الاحتلال", "تصعيد المقاومة", "فإن أيامًا سوداءَ في انتظاره", "حربنا مفتوحة", "تصعيد خطير", "بالبنادق والدماء فقط", "لضربة تلو الأخرى"]


const highlightWords = (text, words) => {
    // Sort the words by length in descending order to prioritize longer matches
    words.sort((a, b) => b.length - a.length);

    // Join the words/sentences with | to create a regex pattern
    const regex = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
        words.some(word => word === part) ?
        <strong key={index}>{part}</strong> :
        part
    );
};

const Tweet = ({ tweet }) => {
    return (
        <div className="tweet-div">
            <p dir="auto" className="tweet-id"> title: {tweet.tweetId} </p>
            <br/>
            <br/>
            <p dir="auto" className="tweet-text"> {highlightWords(tweet.tweetText, wordsToBold)} </p>
        </div>
    );
}

export default Tweet;
