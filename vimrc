" algo-tutor student vimrc
" Place at ~/.vimrc or ~/.config/nvim/init.vim
"
" Progressive vim teaching:
" Phase 0: hjkl, i, Esc, :w, :q, :wq, dd, yy, p, u, Ctrl+r
" Phase 1: v, V, Ctrl+v, :s/, /pattern, :%s/, macros (q)
" Phase 2: :term, :split, :vsplit, :cn, :cp, :make, quickfix

set nocompatible
set number relativenumber
set cursorline
set colorcolumn=100
set tabstop=4 shiftwidth=4 softtabstop=4 expandtab
set autoindent smartindent
set cindent
set cinoptions=l1,g0,(0,W4
set nowrap
set laststatus=2
set showcmd
set wildmenu
set hlsearch incsearch
set ignorecase smartcase
set backspace=indent,eol,start
set mouse=a
set clipboard=unnamedplus
set encoding=utf-8
filetype plugin indent on
syntax on

" Leader key
let mapleader = ' '

" ============================================================
" Compile & Run
" ============================================================
" F5: compile current file
nnoremap <F5> :w<CR>:!g++ -O2 -std=c++17 -Wall -Wextra -Wshadow -o %< %<CR>

" F6: compile and run
nnoremap <F6> :w<CR>:!g++ -O2 -std=c++17 -Wall -Wextra -Wshadow -o %< % && ./%< < input.txt<CR>

" F7: compile and run (with custom input from stdin)
nnoremap <F7> :w<CR>:!g++ -O2 -std=c++17 -Wall -Wextra -Wshadow -o %< % && ./%<<CR>

" F8: compile and run with time measurement
nnoremap <F8> :w<CR>:!g++ -O2 -std=c++17 -Wall -Wextra -Wshadow -o %< % && time ./%< < input.txt<CR>

" ============================================================
" Debug Builds
" ============================================================
" Shift+F5: compile with debug symbols
nnoremap <S-F5> :w<CR>:!g++ -g -O0 -std=c++17 -Wall -Wextra -Wshadow -o %< %<CR>

" Shift+F6: compile with debug + sanitizers (ASan + UBSan)
nnoremap <S-F6> :w<CR>:!g++ -g -O0 -std=c++17 -Wall -Wextra -Wshadow -fsanitize=address,undefined -o %< %<CR>

" Shift+F7: compile with debug only (no optimization)
nnoremap <S-F7> :w<CR>:!g++ -g -O0 -std=c++17 -o %< %<CR>

" Shift+F8: compile with ThreadSanitizer
nnoremap <S-F8> :w<CR>:!g++ -g -O1 -std=c++17 -fsanitize=thread -o %< %<CR>

" ============================================================
" GDB Debugging
" ============================================================
" F9: start gdb on current executable
nnoremap <F9> :!gdb ./%<<CR>

" F10: compile debug + start gdb
nnoremap <F10> :w<CR>:!g++ -g -O0 -std=c++17 -o %< % && gdb ./%<<CR>

" F11: compile debug + run with args
nnoremap <F11> :w<CR>:!g++ -g -O0 -std=c++17 -o %< % && gdb --args ./%< < input.txt<CR>

" F12: compile with sanitizers + gdb
nnoremap <F12> :w<CR>:!g++ -g -O0 -std=c++17 -fsanitize=address,undefined -o %< % && gdb ./%<<CR>

" ============================================================
" Code Formatting (astyle)
" ============================================================
" Leader+f: format current file
nnoremap <Leader>f :w<CR>:!astyle --style=stroustrup --indent=spaces=4 --max-code-length=100 --break-closing-braces --break-elseifs --add-braces --align-pointer=name --pad-oper --pad-header --convert-tabs %<CR>:e<CR>

" Leader+F: format and check diff
nnoremap <Leader>F :w<CR>:!cp % %.bak && astyle --style=stroustrup --indent=spaces=4 --max-code-length=100 --break-closing-braces --break-elseifs --add-braces --align-pointer=name --pad-oper --pad-header --convert-tabs % && diff %.bak %<CR>

" ============================================================
" Quick Compile Checks
" ============================================================
" Leader+c: syntax check only (no output)
nnoremap <Leader>c :w<CR>:!g++ -fsyntax-only -std=c++17 -Wall -Wextra %<CR>

" Leader+C: strict warnings check
nnoremap <Leader>C :w<CR>:!g++ -fsyntax-only -std=c++17 -Wall -Wextra -Wpedantic -Wconversion -Wsign-conversion %<CR>

" Leader+o: optimize check (compile to assembly)
nnoremap <Leader>o :w<CR>:!g++ -O2 -std=c++17 -S -o %.s % && cat %.s<CR>

" ============================================================
" Input/Output Files
" ============================================================
" Leader+i: create input.txt if not exists
nnoremap <Leader>i :e input.txt<CR>

" Leader+r: run with input.txt
nnoremap <Leader>r :w<CR>:!g++ -O2 -std=c++17 -o %< % && ./%< < input.txt<CR>

" Leader+R: run with input.txt and diff against output.txt
nnoremap <Leader>R :w<CR>:!g++ -O2 -std=c++17 -o %< % && ./%< < input.txt > my_output.txt && diff output.txt my_output.txt<CR>

" ============================================================
" Static Analysis (cppcheck)
" ============================================================
" Leader+p: run cppcheck
nnoremap <Leader>p :!cppcheck --enable=all --std=c++17 --suppress=missingIncludeSystem %<CR>

" Leader+P: run cppcheck with more checks
nnoremap <Leader>P :!cppcheck --enable=all --std=c++17 --suppress=missingIncludeSystem --inline-suppr --force %<CR>

" ============================================================
" Quick Insert Templates
" ============================================================
" Leader+t: insert competitive programming template
nnoremap <Leader>t i#include <bits/stdc++.h>
using namespace std;
using i64 = long long;

constexpr int MAX_N = 200'000;

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;

    cout << 0 << '\n';
    return 0;
}<Esc>

" Leader+T: insert with solve() function
nnoremap <Leader>T i#include <bits/stdc++.h>
using namespace std;
using i64 = long long;

constexpr int MAX_N = 200'000;

int solve(int n)
{
    return n;
}

int main()
{
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    cout << solve(n) << '\n';
    return 0;
}<Esc>

" ============================================================
" Window Navigation
" ============================================================
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" ============================================================
" Terminal (for running bash inside vim)
" ============================================================
" Leader+: open terminal
nnoremap <Leader><CR> :term<CR>

" Leader+: open terminal in split
nnoremap <Leader>t<CR> :split term://bash<CR>

" Escape from terminal mode
tnoremap <Esc> <C-\><C-n>
tnoremap <Leader><Esc> <C-\><C-n>

" ============================================================
" Quick Fix Common Style Issues
" ============================================================
" Leader+s: fix common style problems
nnoremap <Leader>s :%s/\s\+$//e<CR>:%s/\t/    /g<CR>:nohl<CR>

" Leader+d: add braces to control structures (basic)
nnoremap <Leader>d :%s/^\s*\(if\|else\|for\|while\)\s*\(.*\)\s*$/\1 \2\r{/gc<CR>

" ============================================================
" Assembly & Debug Info
" ============================================================
" Leader+a: show assembly with source
nnoremap <Leader>a :!g++ -g -O2 -std=c++17 -Wa,-adhln -o /dev/null % \| less<CR>

" Leader+A: show symbols (nm)
nnoremap <Leader>A :!g++ -O2 -std=c++17 -o %< % && nm -C %< \| less<CR>

" ============================================================
" Contest Utilities
" ============================================================
" Leader+1: create problem A
nnoremap <Leader>1 :e problem_a.cpp<CR>

" Leader+2: create problem B
nnoremap <Leader>2 :e problem_b.cpp<CR>

" Leader+3: create problem C
nnoremap <Leader>3 :e problem_c.cpp<CR>

" Leader+0: test all problems
nnoremap <Leader>0 :!for f in problem_*.cpp; do g++ -O2 -std=c++17 -o ${f%.cpp} $f && echo "=== $f ===" && ./${f%.cpp} < input.txt; done<CR>

" ============================================================
" Anki Integration (Phase 1+)
" ============================================================
" Leader+as: sync failed problems to Anki
nnoremap <Leader>as :!anki sync-failed<CR>

" Leader+an: add current problem as Anki card
nnoremap <Leader>an :!anki add-card --deck "algo-tutor" --front "%:p" --back "Error: " <CR>

" ============================================================
" Feynman Practice (Phase 1+)
" ============================================================
" Leader+fe: open Feynman practice file
nnoremap <Leader>fe :e feynman_practice.md<CR>

" Leader+fs: save Feynman notes
nnoremap <Leader>fs :w<CR>:echo "Feynman notes saved"<CR>

" ============================================================
" Show Build Info
" ============================================================
command! BuildInfo echo system("g++ --version | head -1")
