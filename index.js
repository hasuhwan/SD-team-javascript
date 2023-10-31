//모체 클래스
class App {
  constructor() {
    this.state = {
      data: new Map(),
    };
    this.graph = new Graph(this.state, this.update);
    this.valueEdit = new ValueEdit(this.state, this.setState, this.update);
    this.valueAdd = new ValueAdd(this.state, this.setState, this.update);
    this.valueJsonEdit = new JsonValueEdit(
      this.state,
      this.setState,
      this.update
    );
  }
  setState = (newState) => {
    this.state = newState;
  };
  update = () => {
    this.graph.updateRender(this.state);
    this.valueEdit.updateRender(this.state);
    this.valueAdd.updateRender(this.state);
    this.valueJsonEdit.updateRender(this.state);
  };
}

//그래프 클래스
class Graph {
  constructor(state, update) {
    this.state = state;
    this.update = update;
    this.$targetY = document.getElementById("graph-bar-y");
    this.$targetX = document.getElementById("graph-bar-x");
    this.render(this.state);
  }

  //그래프 렌더링 메서드 초기 렌더 및 업데이트 시 호출
  makeGraph(state) {
    const max = state.data.size === 0 ? 0 : Math.max(...state.data.values());
    const min = state.data.size === 0 ? 0 : Math.min(...state.data.values());
    const absMax = Math.max(Math.abs(max), Math.abs(min));
    const $fragmentY = new DocumentFragment();
    const $fragmentX = new DocumentFragment();
    [-absMax, 0, absMax].forEach((num) => {
      const $li = document.createElement("li");
      const $span = document.createElement("span");
      $span.innerText = num;
      $li.appendChild($span);
      $fragmentY.appendChild($li);
    });
    this.$targetY.appendChild($fragmentY);
    for (let [id, value] of state.data.entries()) {
      const $li = document.createElement("li");
      const $div = document.createElement("div");
      const $gageSpan = document.createElement("span");
      const $valueSpan = document.createElement("span");
      $gageSpan.setAttribute("data-value", value);
      const absValue = Math.abs(value);
      $gageSpan.style.height = (absValue / absMax) * 100 + "%";
      if (value < 0) {
        $gageSpan.style.backgroundColor = "blue";
        $gageSpan.style.top = 0;
        $div.style.bottom = 0 + "%";
      } else {
        $gageSpan.style.backgroundColor = "red";
      }
      $valueSpan.innerText = id;
      $div.appendChild($gageSpan);
      $li.append($div, $valueSpan);
      $fragmentX.appendChild($li);
    }
    this.$targetX.appendChild($fragmentX);
  }
  //초기 렌더 메서드
  render(state) {
    this.makeGraph(state);
    this.$targetX.addEventListener("click", (e) => {
      const value = e.target.dataset.value;
      if (value !== undefined) {
        alert(`값:${value}`);
      }
    });
  }
  //업데이트 메서드
  updateRender(state) {
    this.$targetX.replaceChildren();
    this.$targetY.replaceChildren();
    this.makeGraph(state);
  }
}

//값 편집 클래스
class ValueEdit {
  constructor(state, setState, update) {
    this.setState = setState;
    this.update = update;
    this.state = state;
    this.data = new Map(this.state.data.entries());
    this.$target = document.getElementById("value-edit-contents");
    this.applyBtn = document.getElementById("value-edit-apply");
    this.render();
  }
  //편집 가능한 리스트 렌더 메서드
  makeList() {
    if (this.state.data.size === 0) {
      this.applyBtn.disabled = true;
    }
    const $fragment = new DocumentFragment();
    for (let [key, value] of this.state.data.entries()) {
      const $li = document.createElement("li");
      $li.className = "edit-list";
      const $div = document.createElement("div");
      $div.innerText = key;
      const $input = document.createElement("input");
      $input.value = value;
      $input.type = "number";
      $input.setAttribute("data-edit", key);
      const $button = document.createElement("button");
      $button.innerText = "삭제";
      $button.setAttribute("data-delete", key);
      $li.append($div, $input, $button);
      $fragment.appendChild($li);
    }
    this.$target.appendChild($fragment);
  }
  //초기 렌더 메서드
  render() {
    this.makeList();
    this.$target.addEventListener("click", (e) => {
      const deleteId = e.target.dataset.delete;

      if (deleteId !== undefined && this.data.has(deleteId)) {
        if (confirm("정말 삭제하실거에요?")) {
          this.data.delete(deleteId);
          this.setState({ ...this.state, data: this.data });
          this.update();
        }
      }
    });
    this.$target.addEventListener("input", (e) => {
      const editId = e.target.dataset.edit;
      if (editId !== undefined) {
        this.data.set(editId, Number(e.target.value));
      }
    });

    this.applyBtn.addEventListener("click", () => {
      this.setState({ ...this.setState, data: this.data });
      this.update();
    });
  }
  //업데이트 메서드 기존에 있던 노드 삭제 및 makeList 호출 용도
  updateRender(state) {
    this.state = state;
    this.data = new Map(this.state.data.entries());
    this.$target.replaceChildren();
    this.makeList();
  }
}

//값 추가 클래스
class ValueAdd {
  constructor(state, setState, update) {
    this.state = state;
    this.setState = setState;
    this.update = update;
    this.data = new Map(this.state.data.entries());
    this.$idInput = document.getElementById("add-id");
    this.$valueInput = document.getElementById("add-value");
    this.$addBtn = document.getElementById("add-btn");
    this.render();
  }
  //리스너 추가 용도 메서드
  render() {
    this.$addBtn.addEventListener("click", () => {
      if (this.$idInput.value === "" || this.$valueInput.value === "") {
        alert("ID와 VALUE가 필요합니다.");
        return;
      }
      if (this.state.data.has(this.$idInput.value)) {
        alert("중복된 아이디가 존재합니다. 확인해주세요.");
        return;
      }

      this.data.set(this.$idInput.value, Number(this.$valueInput.value));
      this.setState({ ...this.state, data: this.data });
      this.$idInput.value = "";
      this.$valueInput.value = "";
      this.update();
    });
  }
  //업데이트 메서드
  updateRender(state) {
    this.state = state;
    this.data = new Map(this.state.data.entries());
  }
}

//값 고급 편집 클래스
class JsonValueEdit {
  constructor(state, setState, update) {
    this.state = state;
    this.setState = setState;
    this.update = update;
    this.data = new Map(this.state.data.entries());
    this.$target = document.getElementById("json-edit-textarea");
    this.render();
  }
  //초기 렌더 메서드
  render() {
    this.$target.value = this.toString();
    document
      .getElementById("value-json-edit-apply")
      .addEventListener("click", () => {
        const newData = this.toParse(this.$target.value);
        if (newData === null) {
          alert("중복된 아이디가 있습니다.");
          return;
        }
        this.setState({ ...this.state, data: newData });
        this.update();
      });
  }
  //업데이트 메서드
  updateRender(state) {
    this.state = state;
    this.data = new Map(this.state.data.entries());
    this.$target.value = this.toString();
  }
  //객체를 문자열로 반환시키는 메서드
  toString() {
    const toJSONArr = [];
    for (let [key, value] of this.data.entries()) {
      toJSONArr.push({ id: key, value });
    }
    return JSON.stringify(toJSONArr);
  }
  //문자열을 객체로 변환 가능한가 판단 후 반환하는 메서드
  toParse(str) {
    try {
      const newData = JSON.parse(str.replace(/ /g, ""));
      const newMap = new Map();
      for (let { id, value } of newData) {
        if (newMap.has(id)) {
          return null;
        }
        newMap.set(id, Number(value));
      }
      return newMap;
    } catch (e) {
      alert("유효한 JSON 형식이 아니에요.");
    }
  }
}

//모체 실행
new App();
