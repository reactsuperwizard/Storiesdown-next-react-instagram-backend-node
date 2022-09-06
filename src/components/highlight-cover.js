import { Component } from "react";
import Router from "next/router";
import Link from "next/link";

class HighlightCover extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  formatDate() {
    const d = new Date(this.props.highlightCover.latest_reel_media * 1000);
    return (
      d.toLocaleString("default", { month: "short" }) +
      " " +
      (d.getDate() < 10 ? "0" + d.getDate() : d.getDate()) +
      " " +
      d.getFullYear()
    );
  }

  render() {
    return (
      <div className="text-center">
        {/* <Link
          href={`/highlights/[id]?userJson=${encodeURIComponent(
            JSON.stringify(this.props.user)
          )}`}
          as={`/highlights/${this.props.highlightCover.id}`}
        >
          <img
            className="highlight-cover-img mb-2"
            src={this.props.highlightCover.cover_image_url}
          />
        </Link> */}
        <a href={`/highlights/${this.props.highlightCover.id}`}>
          <img
            className="highlight-cover-img mb-2"
            src={this.props.highlightCover.cover_image_url}
          />
        </a>
        <div>{this.props.highlightCover.title}</div>
        <div>{this.formatDate()}</div>
      </div>
    );
  }
}

export default HighlightCover;
