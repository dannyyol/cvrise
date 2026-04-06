import { splitHtmlToPages } from '@talers/html-pages';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { clsx } from 'clsx';
import { A4_DIMENSIONS } from '@/src/lib/paginationUtils';
import {
  getLetterSpacingCssValue,
  getLineHeightCssValue,
  getRootFontSizePx,
  type FontSizeSetting,
  type LetterSpacingSetting,
  type LineSpacingSetting,
} from '@/src/lib/typography';

interface PaginatedPreviewProps {
  templateId: string;
  children: React.ReactNode;
  accentColor?: string;
  fontFamily?: string;
  fontSize?: FontSizeSetting;
  letterSpacing?: LetterSpacingSetting;
  lineSpacing?: LineSpacingSetting;
  renderAll?: boolean;
  debounceTime?: number;
  isExport?: boolean;
  scaleMode?: 'fit' | 'fill';
}

export default function PaginatedPreview({
  templateId,
  children,
  accentColor,
  fontFamily,
  fontSize,
  letterSpacing,
  lineSpacing,
  renderAll = false,
  debounceTime = 150,
  isExport = false,
  scaleMode = 'fit',
}: PaginatedPreviewProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [baseScale, setBaseScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const splitContainerRef = useRef<HTMLDivElement | null>(null);
  const splitContainerTemplateClassRef = useRef<string | null>(null);
  const abortRef = useRef<{ aborted?: boolean } | null>(null);

  const html = useMemo(() => {
    return renderToStaticMarkup(<>{children}</>);
  }, [children]);

  const showAllPages = renderAll || isExport;

  useEffect(() => {
    if (splitContainerRef.current) return;

    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.visibility = 'hidden';
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '0';
    el.style.transform = 'translateY(-10000px)';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '-1';
    document.body.appendChild(el);
    splitContainerRef.current = el;

    return () => {
      if (splitContainerRef.current === el) {
        splitContainerRef.current = null;
      }
      el.remove();
    };
  }, []);

  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      if (isExport) {
        setBaseScale(1);
        return;
      }

      const clientWidth = containerRef.current.clientWidth;
      const rectWidth = containerRef.current.getBoundingClientRect().width;
      const viewportWidth = window.innerWidth;
      const containerWidth = Math.max(clientWidth, rectWidth, 0) || viewportWidth;
      const screenHeight = window.innerHeight;
      const widthUsageRatio =
        viewportWidth < 360
          ? 0.99
          : viewportWidth < 480
            ? 0.98
            : viewportWidth < 768
              ? 0.96
              : viewportWidth < 1024
                ? 0.94
                : 0.92;

      if (scaleMode === 'fill') {
        const fillScale = (containerWidth * Math.min(1, widthUsageRatio + 0.02)) / A4_DIMENSIONS.width;
        setBaseScale(fillScale);
        return;
      }

      const availableHeight = screenHeight;
      const scaleByWidth = (containerWidth * widthUsageRatio) / A4_DIMENSIONS.width;
      const scaleByHeight = availableHeight / A4_DIMENSIONS.height;
      setBaseScale(Math.min(scaleByWidth, scaleByHeight));
    };

    const containerEl = containerRef.current;
    if (!containerEl) return;

    const raf = window.requestAnimationFrame(updateScale);
    window.addEventListener('resize', updateScale);
    const ro = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateScale);
    ro?.observe(containerEl);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateScale);
      ro?.disconnect();
    };
  }, [isExport, scaleMode]);

  const scale = useMemo(() => {
    if (isExport) return 1;
    const next = baseScale * zoom;
    return Math.min(2, Math.max(0.35, next));
  }, [baseScale, zoom, isExport]);

  useEffect(() => {
    if (!splitContainerRef.current) return;

    const container = splitContainerRef.current;
    const rootFontSizePx = getRootFontSizePx(fontSize);
    const letterSpacingValue = getLetterSpacingCssValue(letterSpacing);
    const lineHeightValue = getLineHeightCssValue(lineSpacing);

    const pageInnerWidth = A4_DIMENSIONS.width - 2 * A4_DIMENSIONS.margin;
    const pageInnerHeight = A4_DIMENSIONS.height - 2 * A4_DIMENSIONS.margin;
    container.style.width = `${pageInnerWidth}px`;
    container.style.height = 'auto';
    container.style.maxHeight = 'none';
    container.style.minHeight = `${pageInnerHeight}px`;
    container.style.overflow = 'visible';
    container.style.boxSizing = 'border-box';
    container.style.fontSize = `${rootFontSizePx}px`;
    container.style.fontFamily = fontFamily || 'inherit';
    if (splitContainerTemplateClassRef.current) {
      container.classList.remove(splitContainerTemplateClassRef.current);
    }
    const nextTemplateClass = `cv-${templateId}`;
    container.classList.add(nextTemplateClass);
    splitContainerTemplateClassRef.current = nextTemplateClass;

    // container.style.setProperty('--cv-padding', `${A4_DIMENSIONS.margin}px`);
    // container.style.setProperty('--page-padding', `${A4_DIMENSIONS.margin}px`);
    container.style.setProperty('--accent-color', accentColor || '#475569');
    container.style.setProperty('--font-family', fontFamily || 'inherit');
    container.style.setProperty('--letter-spacing', letterSpacingValue);
    container.style.setProperty('--line-height', lineHeightValue);
    container.style.letterSpacing = letterSpacingValue;
    container.style.lineHeight = lineHeightValue;
  }, [accentColor, fontFamily, fontSize, letterSpacing, lineSpacing, templateId]);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      if (!splitContainerRef.current) return;

      abortRef.current = { aborted: false };
      const localAbort = abortRef.current;

      try {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const parallelContainer = doc.querySelector('[data-parallel-pagination="true"]');
        const parallelColumns = parallelContainer?.querySelectorAll('[data-parallel-column="true"]');

        if (parallelContainer && parallelColumns && parallelColumns.length > 0) {
          // --- Parallel Pagination Logic ---
          // Prepare independent split containers for each column
          const columnPagesMap: string[][] = [];
          
          const originalContainerWidth = splitContainerRef.current.style.width;

          splitContainerRef.current.innerHTML = html;
          const measuredContainer = splitContainerRef.current.querySelector('[data-parallel-pagination="true"]');
          const measuredColumns = measuredContainer?.querySelectorAll('[data-parallel-column="true"]');

          const measuredRoot = splitContainerRef.current.firstElementChild as HTMLElement | null;
          const headerSpacerHeight =
            measuredRoot && measuredContainer
              ? Math.max(0, Math.ceil(measuredContainer.getBoundingClientRect().top - measuredRoot.getBoundingClientRect().top)) -50
              : 0;
              
          const columnWidths: string[] = [];
          if (measuredColumns) {
            measuredColumns.forEach((col) => {
               columnWidths.push(getComputedStyle(col).width);
            });
          }

          splitContainerRef.current.innerHTML = '';
          
          const root = doc.body.firstElementChild as HTMLElement; // .cv-html-root
          const header = root.querySelector('header')?.outerHTML || '';
          const styleTag = root.querySelector('style')?.outerHTML || '';
          const rootClasses = root.className;
          const rootStyle = root.getAttribute('style') || '';
          
          const docColumns = parallelContainer.querySelectorAll('[data-parallel-column="true"]');
          
          for (let i = 0; i < docColumns.length; i++) {
             const col = docColumns[i];
             const colContent = col.innerHTML;
             const colWidth = columnWidths[i];
             splitContainerRef.current.style.width = colWidth;
             
             const columnPages: string[] = [];
             const wrapperClass = col.className;
             
             // Inject spacer for the header so the first page content starts lower
             const spacerHtml = headerSpacerHeight > 0 
                ? `<div class="cv-parallel-spacer" style="height: ${headerSpacerHeight}px; display: block;"></div>` 
                : '';
             
              const contentToSplit = `<div class="${wrapperClass}" style="width: 100% !important; float: none !important; height: auto;">${spacerHtml}${colContent}</div>`;
             
             for await (const page of splitHtmlToPages(contentToSplit, { container: splitContainerRef.current }, localAbort)) {
                if (localAbort.aborted) return;
                columnPages.push(page);
             }
             columnPagesMap.push(columnPages);
          }
          
          // Restore container width
          splitContainerRef.current.style.width = originalContainerWidth;
          
          // Merge Pages
          const maxPages = Math.max(...columnPagesMap.map(p => p.length), 0);
          const mergedPages: string[] = [];
          
          const hideSpacerStyle = `<style>.cv-page .cv-parallel-spacer { display: none !important; }</style>`;
          
          for (let i = 0; i < maxPages; i++) {
            let columnsHtml = '';
            const pageContainerClone = parallelContainer.cloneNode(true) as HTMLElement;
            const cloneColumns = pageContainerClone.querySelectorAll('[data-parallel-column="true"]');
            
            cloneColumns.forEach((col, colIndex) => {
               const pageContent = columnPagesMap[colIndex][i] || ''; 
               
               if (pageContent) {
                 const tempDiv = document.createElement('div');
                 tempDiv.innerHTML = pageContent;
                 if (tempDiv.firstElementChild) {
                    col.innerHTML = tempDiv.firstElementChild.innerHTML;
                 } else {
                    col.innerHTML = pageContent;
                 }
               } else {
                 col.innerHTML = ''; 
               }
            });
            
            columnsHtml = pageContainerClone.outerHTML;
            
            const safeRootStyle = rootStyle.replaceAll('"', '&quot;');
            // Only include styleTag on the first page to avoid duplication in PDF export
            const pageHtml = `<div class="${rootClasses}" style="${safeRootStyle}">${hideSpacerStyle}${i === 0 ? styleTag : ''}${i === 0 ? header : ''}${columnsHtml}</div>`;
            mergedPages.push(pageHtml);
          }
          
          if (!localAbort.aborted) {
            setPages(mergedPages);
            setCurrentPage((p) => Math.min(p, Math.max(0, mergedPages.length - 1)));
            if (isExport) {
              // Signal to the backend that the preview is ready for PDF generation
              (window as any).CV_PREVIEW_READY = true;
            }
            // Clear hidden container to free memory and prevent PDF artifacts
            if (splitContainerRef.current) {
              splitContainerRef.current.innerHTML = '';
            }
          }
          return;
        }

        const nextPages: string[] = [];
        for await (const pageHtml of splitHtmlToPages(html, { container: splitContainerRef.current }, localAbort)) {
          if (localAbort.aborted) return;
          // For standard pagination, we need to inject the style tag if it's not present in the chunk
          // But splitHtmlToPages returns chunks of the original HTML.
          // If the style tag was in the header (which is usually on the first page), it might be missing in subsequent pages?
          // No, splitHtmlToPages splits the content.
          // We need to ensure styles are applied.
          // Since we are in the same document, one style tag is enough.
          // However, splitHtmlToPages returns the HTML string for the page content.
          // We wrap it in a div.
          // The `html` input to splitHtmlToPages contains the whole content.
          
          nextPages.push(pageHtml);
          if (nextPages.length === 1) {
            setPages([pageHtml]);
          }
        }

        if (!localAbort.aborted) {
          setPages(nextPages);
          setCurrentPage((p) => Math.min(p, Math.max(0, nextPages.length - 1)));
          if (isExport) {
            // Signal to the backend that the preview is ready for PDF generation
            (window as any).CV_PREVIEW_READY = true;
          }
          // Clear hidden container to free memory and prevent PDF artifacts
          if (splitContainerRef.current) {
            splitContainerRef.current.innerHTML = '';
          }
        }
      } finally {}
    }, debounceTime);

    return () => {
      window.clearTimeout(timeout);
      if (abortRef.current) abortRef.current.aborted = true;
    };
  }, [html, templateId, debounceTime, fontSize, letterSpacing, lineSpacing, fontFamily]);

  const handlePrevPage = () => setCurrentPage((p) => Math.max(0, p - 1));
  const handleNextPage = () => setCurrentPage((p) => Math.min(pages.length - 1, p + 1));
  const handleZoomIn = () => setZoom((z) => Math.min(2, parseFloat((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))));

  const pageFrameStyle = useMemo<React.CSSProperties>(() => {
    if (isExport) {
      return {
        boxSizing: 'border-box',
        width: '210mm',
        height: '297mm',
        boxShadow: 'none',
        borderRadius: 0,
        background: 'white',
        overflow: 'hidden',
        position: 'relative',
      };
    }

    const frameScale = scale;
    const frameWidthPx = Math.round(A4_DIMENSIONS.width * frameScale * 100) / 100;
    const frameHeightPx = Math.round(A4_DIMENSIONS.height * frameScale * 100) / 100;
    return {
      boxSizing: 'border-box',
      width: `${frameWidthPx}px`,
      height: `${frameHeightPx}px`,
      boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
      borderRadius: 0,
      background: 'white',
      overflow: 'hidden',
      position: 'relative',
      transition: 'width 0.2s ease-in-out, height 0.2s ease-in-out',
    };
  }, [scale, isExport]);

  const pageStyle = useMemo<React.CSSProperties>(() => {
    return {
      boxSizing: 'border-box',
      width: isExport ? '210mm' : `${A4_DIMENSIONS.width}px`,
      height: isExport ? '297mm' : `${A4_DIMENSIONS.height}px`,
      padding: `${A4_DIMENSIONS.margin}px`,
      position: 'absolute',
      top: 0,
      left: 0,
      transform: isExport ? 'none' : `scale(${scale})`,
      transformOrigin: 'top left',
      transition: isExport ? undefined : 'transform 0.2s ease-in-out',
      willChange: isExport ? undefined : 'transform',
      ['--accent-color' as any]: accentColor || '#475569',
      ['--page-padding' as any]: `${A4_DIMENSIONS.margin}px`,
      ['--cv-padding' as any]: `${A4_DIMENSIONS.margin}px`,
    };
  }, [scale, isExport, accentColor]);

  const pageInnerStyle = useMemo<React.CSSProperties>(() => {
    const rootFontSizePx = getRootFontSizePx(fontSize);
    const letterSpacingValue = getLetterSpacingCssValue(letterSpacing);
    const lineHeightValue = getLineHeightCssValue(lineSpacing);

    return {
      boxSizing: 'border-box',
      // width: '100%',
      height: '100%',
      padding: '0px',
      overflow: 'visible',
      fontFamily: fontFamily || 'inherit',
      fontSize: `${rootFontSizePx}px`,
      letterSpacing: letterSpacingValue,
      lineHeight: lineHeightValue,
      ['--cv-padding' as any]: `${A4_DIMENSIONS.margin}px`,
      ['--page-padding' as any]: `${A4_DIMENSIONS.margin}px`,
      ['--accent-color' as any]: accentColor || '#475569',
      ['--font-family' as any]: fontFamily || 'inherit',
      ['--letter-spacing' as any]: letterSpacingValue,
      ['--line-height' as any]: lineHeightValue,
    };
  }, [accentColor, fontFamily, fontSize, letterSpacing, lineSpacing]);

  const pagesContainerStyle = useMemo<React.CSSProperties>(() => {
    if (isExport) return {};
    const paddingPerSidePx = typeof window !== 'undefined' && window.innerWidth >= 768 ? 16 : 8;
    const minContentWidthPx = Math.ceil(A4_DIMENSIONS.width * scale + paddingPerSidePx * 2);
    return {
      minWidth: `max(100%, ${minContentWidthPx}px)`,
      transition: 'min-width 0.2s ease-in-out',
    };
  }, [isExport, scale]);

  return (
    <div className={clsx('w-full h-full flex flex-col', isExport && 'cv-export-mode')}>
      {!isExport && (
        <div className="cv-preview-toolbar w-full flex items-center justify-between px-6 py-1 z-20 shrink-0">
          <div className="flex items-center">
             <span className="text-xs text-gray-500 font-medium">
               {showAllPages ? `${pages.length} Pages` : `Page ${Math.min(currentPage + 1, Math.max(1, pages.length))} of ${Math.max(1, pages.length)}`}
             </span>
          </div>
          
          <div className="flex items-center gap-2 z-0">
            {!showAllPages && pages.length > 1 && (
              <div className="flex items-center gap-0.5">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 0 || pages.length === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage >= pages.length - 1 || pages.length === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
                    aria-label="Next Page"
                  >
                    <ChevronRight size={14} />
                  </button>
              </div>
            )}
            
            <div className="flex items-center gap-0.5">
                <button 
                  onClick={handleZoomOut}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button 
                  onClick={handleZoomIn}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
            </div>
          </div>
        </div>
      )}

      {pages.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/50 backdrop-blur-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}
      <div
        ref={containerRef}
        className="cv-preview-content flex-1 w-full overflow-x-auto overflow-y-auto pt-3 pb-8 flex flex-col relative"
        style={{ scrollbarGutter: 'stable both-edges' }}
      >
        <div className={clsx('w-full', !isExport && 'px-2 md:px-4')} style={pagesContainerStyle}>
          <div className={clsx('flex flex-col w-full', isExport ? 'gap-0' : 'gap-6')}>
            {pages.length === 0 ? null : showAllPages ? (
              pages.map((pageHtml, index) => (
                <div
                  key={`page-${index}`}
                  className={clsx('cv-page shrink-0', !isExport && 'mx-auto')}
                  style={{
                    ...pageFrameStyle,
                    ...(isExport ? { breakAfter: index === pages.length - 1 ? 'auto' : 'page' } : {}),
                  }}
                >
                  <div className="page" style={pageStyle}>
                    <div
                      className="page-inner"
                      style={pageInnerStyle}
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div key={`page-${currentPage}`} className={clsx('cv-page shrink-0', !isExport && 'mx-auto')} style={pageFrameStyle}>
                <div className="page" style={pageStyle}>
                  <div
                    className="page-inner"
                    style={pageInnerStyle}
                    dangerouslySetInnerHTML={{ __html: pages[currentPage] ?? '' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
