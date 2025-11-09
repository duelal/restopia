// SVG要素の取得
const svg = document.getElementById('diagram');
const svgNS = "http://www.w3.org/2000/svg";

// 表示状態管理
let showLabels = true;

// グループの初期配置データ
let groupPositions = [];

// 初期化
function init() {
    createLegend();
    layoutGroups();
    renderDiagram();
    setupEventListeners();
}

// 凡例の作成
function createLegend() {
    const legendContainer = document.getElementById('legend-items');
    legendContainer.innerHTML = '';

    restaurantData.groups.forEach(group => {
        const item = document.createElement('div');
        item.className = 'legend-item';

        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = group.color;

        const text = document.createElement('span');
        text.className = 'legend-text';
        text.textContent = group.name;

        item.appendChild(colorBox);
        item.appendChild(text);
        legendContainer.appendChild(item);
    });
}

// グループの自動配置（グリッドレイアウト）
function layoutGroups() {
    const containerWidth = svg.clientWidth;
    const containerHeight = svg.clientHeight;
    const padding = 20;

    // グループ数に応じてグリッド計算
    const groupCount = restaurantData.groups.length;
    const cols = Math.ceil(Math.sqrt(groupCount));
    const rows = Math.ceil(groupCount / cols);

    const cellWidth = (containerWidth - padding * 2) / cols;
    const cellHeight = (containerHeight - padding * 2) / rows;

    groupPositions = restaurantData.groups.map((group, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);

        // レストラン数に応じてボックスサイズを調整
        const restaurantCount = group.restaurants.length;
        const itemsPerRow = Math.ceil(Math.sqrt(restaurantCount));
        const boxWidth = Math.min(cellWidth * 0.9, itemsPerRow * 120 + 40);
        const boxHeight = Math.min(cellHeight * 0.9, Math.ceil(restaurantCount / itemsPerRow) * 50 + 80);

        return {
            id: group.id,
            x: padding + col * cellWidth + (cellWidth - boxWidth) / 2,
            y: padding + row * cellHeight + (cellHeight - boxHeight) / 2,
            width: boxWidth,
            height: boxHeight
        };
    });
}

// 相関図の描画
function renderDiagram() {
    // SVGをクリア
    svg.innerHTML = '';

    restaurantData.groups.forEach((group, groupIndex) => {
        const pos = groupPositions[groupIndex];

        // グループボックスの作成
        const groupG = document.createElementNS(svgNS, 'g');
        groupG.setAttribute('class', 'group');
        groupG.dataset.groupId = group.id;

        // 背景ボックス
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('class', 'group-box');
        rect.setAttribute('x', pos.x);
        rect.setAttribute('y', pos.y);
        rect.setAttribute('width', pos.width);
        rect.setAttribute('height', pos.height);
        rect.setAttribute('stroke', group.color);
        rect.setAttribute('fill', group.color);
        rect.setAttribute('fill-opacity', '0.1');
        groupG.appendChild(rect);

        // グループ名ラベル
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('class', 'group-label');
        label.setAttribute('x', pos.x + pos.width / 2);
        label.setAttribute('y', pos.y + 25);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', group.color);
        label.textContent = group.name;
        groupG.appendChild(label);

        // レストラン項目の配置
        const itemsPerRow = Math.ceil(Math.sqrt(group.restaurants.length));
        const itemWidth = 100;
        const itemHeight = 35;
        const itemPadding = 10;

        group.restaurants.forEach((restaurant, index) => {
            const col = index % itemsPerRow;
            const row = Math.floor(index / itemsPerRow);

            const itemG = document.createElementNS(svgNS, 'g');
            itemG.setAttribute('class', 'restaurant-item');

            const itemX = pos.x + 20 + col * (itemWidth + itemPadding);
            const itemY = pos.y + 45 + row * (itemHeight + itemPadding);

            // 背景
            const itemRect = document.createElementNS(svgNS, 'rect');
            itemRect.setAttribute('class', 'restaurant-bg');
            itemRect.setAttribute('x', itemX);
            itemRect.setAttribute('y', itemY);
            itemRect.setAttribute('width', itemWidth);
            itemRect.setAttribute('height', itemHeight);
            itemG.appendChild(itemRect);

            // テキスト
            const itemText = document.createElementNS(svgNS, 'text');
            itemText.setAttribute('class', 'restaurant-text');
            itemText.setAttribute('x', itemX + itemWidth / 2);
            itemText.setAttribute('y', itemY + itemHeight / 2 + 5);
            itemText.setAttribute('text-anchor', 'middle');
            itemText.textContent = restaurant;
            itemG.appendChild(itemText);

            groupG.appendChild(itemG);
        });

        svg.appendChild(groupG);
    });
}

// イベントリスナーの設定
function setupEventListeners() {
    // リセットボタン
    document.getElementById('resetBtn').addEventListener('click', () => {
        layoutGroups();
        renderDiagram();
    });

    // ラベル表示切替ボタン
    document.getElementById('toggleLabelsBtn').addEventListener('click', () => {
        showLabels = !showLabels;
        const labels = document.querySelectorAll('.group-label');
        labels.forEach(label => {
            label.style.display = showLabels ? 'block' : 'none';
        });
    });

    // ウィンドウリサイズ対応
    window.addEventListener('resize', () => {
        layoutGroups();
        renderDiagram();
    });
}

// ページ読み込み時に初期化
window.addEventListener('load', init);
