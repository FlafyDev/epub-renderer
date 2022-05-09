import "./style.css";
import {
  onMoveInnerPage,
  onPageHtml,
  requestNextPage,
  requestPreviousPage,
} from "./flutterCom";
import { Dictionary } from "typescript-collections";
import getSelector from "./utils/getSelector";
import { States } from "./states";

const app = document.querySelector<HTMLDivElement>("#app")!;
(globalThis as any).page = 0;
app.innerHTML = `
<div id="contentContainer"></div>
<button style="position: fixed; inset: 0; height: 50px;" onclick="globalThis.test();">Change page</button>
`;

const contentContainer = document.getElementById("contentContainer")!;
const originalStyles = new Dictionary<Element, CSSStyleDeclaration>((key) =>
  getSelector(key)
);

const states = new States(contentContainer, originalStyles);
let innerPages = 0;

// Events
onPageHtml((newHtml) => {
  contentContainer.innerHTML = `${newHtml}`;

  contentContainer.querySelectorAll("*").forEach((elem) => {
    originalStyles.setValue(elem, window.getComputedStyle(elem));
  });

  states.innerPage = 0;
  states.margin = states.margin;
  states.fontSizePercentage = states.fontSizePercentage;
  states.lineHeightPercentage = states.lineHeightPercentage;
  states.align = states.align;
  states.fontFamily = states.fontFamily;

  // Equation: `entireWidth = columnWidth * innerPages + columnGap * (innerPages - 1) - (left + right) * innerPages`
  const entireWidth = contentContainer.scrollWidth;
  const styles = window.getComputedStyle(contentContainer);
  const columnWidth = parseFloat(styles.columnWidth);
  const columnGap = parseFloat(styles.columnGap);
  innerPages =
    (entireWidth + columnGap) /
    (columnWidth + columnGap - states.margin.side * 2);
});

onMoveInnerPage((previous) => {
  const newInnerPage = states.innerPage - (+previous * 2 - 1);
  console.log(newInnerPage);
  if (newInnerPage < 0) {
    requestPreviousPage();
  } else if (newInnerPage >= innerPages) {
    requestNextPage();
  } else {
    states.innerPage = newInnerPage;
  }
});

// Testing
(globalThis as any).test = () => {
  console.log((window as any).moveInnerPage);
  (window as any).moveInnerPage(false);
};

const render = () => {
  (window as any).setPageHtml(
    `
<style>
.calibre {
  display: block;
  font-size: 1em;
  padding-left: 0;
  padding-right: 0;
  margin: 0 5pt
  }
.calibre1 {
  display: block;
  line-height: 1.2
  }
.calibre2 {
  display: block
  }
.class {
  -webkit-hyphens: none;
  display: block;
  font-weight: bold;
  margin-bottom: 0.8em
  }
.class1 {
  display: block;
  font-weight: bold;
  margin-left: 3.75%
  }
.class2 {
  display: block;
  margin-bottom: 0.463662em;
  text-align: center
  }
.class3 {
  font-size: 0.75em;
  height: auto;
  line-height: 1.087;
  vertical-align: top;
  width: 100%
  }
.class4 {
  display: block;
  font-size: 1.125em;
  font-weight: bold;
  line-height: 1.2;
  margin-top: 0.358974em;
  text-align: center
  }
.class5 {
  display: block;
  margin-top: 1.56648em;
  text-indent: 7.938%
  }
.class6 {
  font-size: 2em;
  font-weight: bold;
  line-height: 1.2
  }
.class7 {
  font-weight: bold
  }
.class8 {
  display: block;
  margin-top: 0.42em;
  text-indent: 7.938%
  }
.class9 {
  font-style: italic
  }
.class10 {
  display: block;
  margin-bottom: 0.42em;
  margin-top: 0.42em;
  text-indent: 7.938%
  }
.class11 {
  display: block;
  font-size: 1.125em;
  font-weight: bold;
  line-height: 1.2;
  text-align: center
  }
.class12 {
  display: block;
  text-indent: 7.938%
  }
.class13 {
  display: block;
  font-style: italic;
  margin-top: 0.42em;
  text-indent: 7.938%
  }
.class14 {
  font-size: 2em;
  line-height: 1.2
  }
.class15 {
  font-size: 0.75em
  }
.class16 {
  font-size: 0.75em;
  vertical-align: sub
  }
.class17 {
  font-size: 2em;
  font-style: italic;
  font-weight: bold;
  line-height: 1.2
  }
.class18 {
  font-size: 0.75em;
  font-style: italic
  }
.class19 {
  display: block;
  margin-bottom: 0.8em
  }
.class20 {
  display: block;
  margin-top: 0.6em
  }
.class21 {
  display: block;
  text-align: center
  }
.class22 {
  font-size: 0.75em;
  height: auto;
  line-height: 1.087;
  vertical-align: top;
  width: 18.945%
  }
.class23 {
  display: block;
  font-size: 1.41667em;
  font-weight: bold;
  line-height: 1.2;
  margin-top: 0.28em;
  text-align: center
  }
.class24 {
  display: block;
  margin-top: 0.42em;
  text-align: center
  }
.class25 {
  font-size: 1.41667em;
  line-height: 1.2
  }
.class26 {
  display: block;
  margin-bottom: 0.42em;
  margin-top: 0.42em;
  text-align: center
  }
  @page {
    margin-bottom: 5pt;
    margin-top: 5pt
    }

</style>

  <div xmlns="http://www.w3.org/1999/xhtml" class="calibre">
  <div id="lj2VeLEFQI20aBE90iDz-w3638" class="class4">Chapter 2:<br class="calibre1" />Welcome to the School<br class="calibre1" />Life of Your Dreams</div>
  <div class="class5"><span class="class6">“A</span>yanokouji-kun, do you have a moment?”</div>
  <div class="class8">She came. She was here. It was terrifying. I’d been feigning sleep during class, pondering society’s true purpose while I pretended to nap, when the devil approached me. Shostakovich’s Symphony No. 11 played in my head, music that captured the sense of people fleeing from pursuing demons and the desperation that comes at the end of the world. Right then, it was the perfect accompaniment.</div>
  <div class="class8">Even though my eyes were closed, I understood. I could feel the devil’s presence as she waited for her slave to awaken. So, as a slave, how exactly could I get out of this situation?</div>
  <div class="class8">My computer-like brain instantly executed all the calculations to arrive at the answer I most needed.</div>
  <div class="class8">Conclusion: I’d pretend not to hear her. I had dubbed this the “Sleeping Strategy.” If she were a kind girl, then she would say something like, “Aw, well, there’s nothing to be done. I’d feel bad to wake you, so I’ll forgive you. ★” “If you don’t get up, I’ll kiss you!” would also be okay.</div>
  <div class="class8">“If you do not awaken within three seconds, I will bestow additional punishment upon you.”</div>
  <div class="class8">“What do you mean, ‘punishment’?” I asked.</div>
  <div class="class8">In an instant, I’d abandoned my “Sleeping Strategy” and yielded to her threats of force. Well, at least I offered some resistance by not meeting her gaze.</div>
  <div class="class8">“See, you <span class="class9">are</span> awake after all, aren’t you?” she said.</div>
  <div class="class8">“I know enough that I’m afraid to make you angry.”</div>
  <div class="class8">“Glad to hear it. Well then, may I have a little of your time?”</div>
  <div class="class8">“If I refuse?”</div>
  <div class="class8">“Well, even though you have no right to veto such a decision, I suppose I <span class="class9">would</span> be exceptionally displeased.”</div>
  <div class="class8">She continued with, “And when I am displeased, then I will prove a major obstacle to your school life, Ayanokouji-kun. For example, I might set a great number of thumbtacks on your chair. Or, when you go to the toilet, I might splash water on you from above. Or stab you with the needle of my mathematical compass. Those kinds of obstacles, I suppose.”</div>
  <div class="class8">“That’s nothing but harassment, or rather, bullying! And besides, that last one sounds strangely familiar, because you’ve already stabbed me before!”</div>
  <div class="class8">I reluctantly sat up at my desk. A girl with beautiful, sharp eyes and long black hair that framed her face stared down at me. Her name was Horikita Suzune, a student of the Tokyo Metropolitan Advanced Nurturing High School, Class D, and my classmate.</div>
  <div class="class8">“Don’t worry. That was only a joke. I wouldn’t splash water on you from above.”</div>
  <div class="class8">“What’s more pressing are the thumbtacks and the compass needle! Look at this! There are still marks from when you stabbed me the last time! Will you take responsibility if it scars me for life?” I rolled up my right sleeve and displayed my forearm to Horikita, so she could see the scars she’d left behind.</div>
  <div class="class8">“Evidence?” she asked.</div>
  <div class="class8">“Huh?”</div>
  <div class="class8">“What about the evidence? Did you decide I’m the culprit without evidence?”</div>
  <div class="class8">She was right; there was no evidence. Even though Horikita was the only one in class close enough to stab me with a needle, I’d be hard-pressed to call that definitive proof…</div>
  <div class="class8">Well, I needed to confirm something first anyway.</div>
  <div class="class8">“So, I’m required to help you? I’ve thought on it again, and, after all, I—”</div>
  <div class="class8">“Ayanokouji-kun. Would you prefer to regret while you suffer or regret while you despair? Which would you like more? Because if you refuse me and force my hand, it will be your responsibility.”</div>
  <div class="class8">I was stuck with Horikita’s two completely absurd choices. It appeared she would not accept any delays. Though it was a mistake to make a deal with this devil, I gave up and obeyed.</div>
  <div class="class10">“All right, then. What am I supposed to do?” I asked, filled with trepidation. Her requests no longer surprised me. I certainly didn’t like how this situation had turned out, but… I thought back to when I’d met this girl two months ago, on the day of the entrance ceremony.</div>
  </div>

  `
  );
};
render();
