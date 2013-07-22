(function() {
  'use strict';
  angular.module('mdApp').filter('md2html', function() {
    return function(md) {
      if (md && md.length) {
        return markdown.toHTML(md);
      } else {
        return '';
      }
    };
  }).filter('scopeCSS', function($filter) {
    return function(css, prefix, prettify) {
      var blacklist, doc, response, scope_selectors, styles;
      doc = document.implementation.createHTMLDocument("");
      styles = document.createElement("style");
      styles.innerText = css;
      doc.body.appendChild(styles);
      blacklist = /(^| )(head|title|link|style|script)($| )/;
      response = '';
      scope_selectors = function(rules) {
        var i, s, selector, selectors, _i, _ref, _results;
        if (!rules.length) {
          return;
        }
        _results = [];
        for (i = _i = 0, _ref = rules.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (rules[i].selectorText) {
            selectors = rules[i].selectorText.split(', ');
            selector = ((function() {
              var _j, _len, _results1;
              _results1 = [];
              for (_j = 0, _len = selectors.length; _j < _len; _j++) {
                s = selectors[_j];
                if (!blacklist.test(s)) {
                  _results1.push(/(^| )(body|html)($| )/.test(s) ? s.replace(/(body|html)/, prefix) : "" + prefix + " " + s);
                }
              }
              return _results1;
            })()).join(', ');
            if (selector) {
              rules[i].selectorText = selector;
              _results.push(response += rules[i].cssText + ' ');
            } else {
              _results.push(void 0);
            }
          } else if (rules[i].media[0] === 'screen') {
            _results.push(scope_selectors(rules[i].cssRules));
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      scope_selectors(styles.sheet.cssRules);
      return response;
    };
  }).filter('prettifyCSS', function() {
    return function(css) {
      return css
    .replace( /^\s+/g,    ''        )
    .replace( /\s*,\s*/g, ', '      )
    .replace( /\s*{\s*/g, ' {\n  '  )
    .replace( /\s*;\s*/g, ';\n  '   )
    .replace( /\*\//g,    '*/\n'    )
    .replace( /\n\n+/g,   '\n'      )
    .replace( /\s*}\s*/g, '\n}\n\n' );
    };
  }).filter('prettifyHTML', function() {
    var closing, count_inline, indent, inline, tag_re;
    indent = function(n, inline_count) {
      if (n <= 0) {
        return "";
      } else {
        return Array(n - inline_count + 1).join('  ');
      }
    };
    inline = function(tag) {
      return tag === 'span' || tag === 'a' || tag === 'code' || tag === 'i' || tag === 'b' || tag === 'em' || tag === 'strong' || tag === 'abbr' || tag === 'img' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6' || tag === 'bdi' || tag === 'bdo' || tag === 'wbr' || tag === 'kbd' || tag === 'del' || tag === 'ins' || tag === 's' || tag === 'rt' || tag === 'rp' || tag === 'var' || tag === 'time' || tag === 'sub' || tag === 'sup' || tag === 'link' || tag === 'title' || tag === 'label' || tag === 'input';
    };
    closing = function(tag) {
      return tag === 'area' || tag === 'br' || tag === 'col' || tag === 'embed' || tag === 'hr' || tag === 'img' || tag === 'input' || tag === 'keygen' || tag === 'link' || tag === 'meta' || tag === 'base' || tag === 'param' || tag === 'source' || tag === 'track' || tag === 'wbr';
    };
    count_inline = function(stack) {
      var t;
      return ((function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = stack.length; _i < _len; _i++) {
          t = stack[_i];
          if (inline(t)) {
            _results.push(t);
          }
        }
        return _results;
      })()).length;
    };
    tag_re = '<(?:(?:(\\w+)[^><]*?)|(?:\\/(\\w+)))>';
    tag_re = new RegExp(tag_re);
    tag_re.compile(tag_re);
    return function(html) {
      var i, inline_count, last_t, m, pretty_html, saved, stack, tag_name;
      saved = html;
      inline_count = 0;
      stack = [];
      pretty_html = "";
      while (html) {
        i = html.search(tag_re);
        if (!(i + 1)) {
          pretty_html += html;
          html = "";
        }
        m = html.match(tag_re);
        if (tag_name = m[1]) {
          if (inline(tag_name)) {
            if (pretty_html.charAt(pretty_html.length - 1) === '\n') {
              pretty_html += indent(stack.length, inline_count);
            }
            pretty_html += html.substr(0, i + m[0].length);
            stack.push(tag_name);
            inline_count += 1;
            html = html.substr(i + m[0].length);
          } else if (closing(tag_name)) {
            if (pretty_html.charAt(pretty_html.length - 1) === '\n') {
              pretty_html += indent(stack.length, inline_count);
            }
            pretty_html += html.substr(0, i + m[0].length);
            html = html.substr(i + m[0].length);
          } else {
            if (i && pretty_html.charAt(pretty_html.length - 1) === '\n') {
              pretty_html += indent(stack.length, inline_count);
            }
            pretty_html += "" + (html.substr(0, i));
            if (pretty_html.charAt(pretty_html.length - 1) !== '\n') {
              pretty_html += '\n';
            }
            pretty_html += indent(stack.length, inline_count) + m[0];
            stack.push(tag_name);
            pretty_html += '\n';
            html = html.substr(i + m[0].length);
          }
        } else if (tag_name = m[2]) {
          last_t = stack.lastIndexOf(tag_name);
          if (last_t + 1) {
            if (inline(tag_name)) {
              inline_count -= 1;
              stack.splice(last_t);
              pretty_html += "" + (html.substr(0, i)) + m[0];
              html = html.substr(i + m[0].length);
            } else {
              if (i && pretty_html.charAt(pretty_html.length - 1) === '\n') {
                pretty_html += indent(stack.length, inline_count);
              }
              stack.splice(last_t);
              inline_count = count_inline(stack);
              pretty_html += "" + (html.substr(0, i)) + (pretty_html.charAt(pretty_html.length - 1) === '\n' ? '' : '\n') + (indent(stack.length, inline_count)) + m[0];
              html = html.substr(i + m[0].length);
              if (html[0] !== '\n') {
                pretty_html += '\n';
              }
            }
          } else {
            pretty_html += "" + (html.substr(0, i + m[0].length));
            html = html.substr(i + m[0].length);
          }
        } else {
          console.warn("UH OH: found a tag that's not an opening tag or a closing tag!?!?");
        }
      }
      return pretty_html;
    };
  });

}).call(this);