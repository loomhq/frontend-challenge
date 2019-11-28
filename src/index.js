import "./styles.css";

import React from "react";
import ReactDOM from "react-dom";

const API = "https://api.hnpwa.com/v0/";

function App() {
  const [newsItems, setItems] = React.useState([]);
  const [isLoadingPage, setIsLoadingPage] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hovered, setHovered] = React.useState(null);
  const [filter, setFilter] = React.useState(null);

  const adjustItems = () => {
    console.log("adjusting items");
    const elements = document.querySelectorAll(".item-container");
    elements.forEach(element => {
      const item = element.querySelector(".item");
      console.log(element.style.height);
      element.style.height = item.clientHeight + "px";
    });
  };

  React.useEffect(() => {
    fetch(API + "news/1.json")
      .then(items => items.json())
      .then(items => setItems(items));
  }, []);

  React.useEffect(() => {
    window.addEventListener("scroll", adjustItems);
    return () => window.removeEventListener("scroll", adjustItems);
  }, []);

  React.useEffect(adjustItems);

  React.useEffect(() => {
    if (isLoadingPage) return;
    console.log("fetching page", page);
    fetch(API + "news/" + page + ".json")
      .then(items => items.json())
      .then(items => {
        setItems(curItems => [...curItems, ...items]);
        setIsLoadingPage(false);
      });
  }, [page]);

  React.useEffect(() => {
    const onScroll = e => {
      const el = document.querySelector(".news-item");
      const prev = el.getAttribute("data-prev-scroll") || 0;
      if (prev > window.pageYOffset) return;
      if (window.innerHeight + window.pageYOffset > el.clientHeight - 400) {
        el.setAttribute("data-prev-scroll", window.pageYOffset);
        if (!isLoadingPage) {
          console.log("loadingin page");
          setPage(page => page + 1);
          setIsLoadingPage(true);
        }
      }
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, [isLoadingPage]);

  // React.useEffect(() => {
  //   if (!hovered) return;
  //   fetch(API + "item/" + hovered + ".json")
  //     .then(item => item.json())
  //     .then(item => setItem(item));
  // }, [hovered]);

  let Items = [];
  const filterMap = {
    s(n) {
      return n < 10;
    },
    m(n) {
      return n < 100;
    },
    l(n) {
      return n >= 100;
    }
  };
  for (var i = 0; i < newsItems.length; i++) {
    const item = newsItems[i];
    const className =
      item.id === hovered ? "item-container highlighted" : "item-container";
    if (filterMap[filter] && !filterMap[filter](item.points)) continue;
    Items.push(
      <div
        onClick={e => (window.location = item.url)}
        className={className}
        onMouseEnter={e => setHovered(item.id)}
        onMouseLeave={e => setHovered(null)}
      >
        <div className="points">{item.points}</div>
        <div className="item">
          <div className="title">{item.title}</div>
          <div>
            by {item.user} {item.time_ago}
          </div>
          <div>{item.comments_count} comments</div>
        </div>
      </div>
    );
  }
  return (
    <div className="App">
      <div className="main-title">Hacker News</div>
      <div className="filter">
        filter by points:
        <button onClick={() => setFilter("s")}>{"< 10"}</button>
        <button onClick={() => setFilter("m")}>{"< 100"}</button>
        <button onClick={() => setFilter("l")}>{"> 100"}</button>
        <button onClick={() => setFilter(null)}>all</button>
      </div>
      <div className="news-item">{Items}</div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
