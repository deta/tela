import type { IPositionable } from "$lib/Positionable.svelte";
import type { IBoard, IBoardSettings } from "$lib/index.js";
import { fastFilter, isInsideViewport } from "$lib/utils.js";
import { createEventDispatcher, getContext, onDestroy, onMount } from "svelte";
import type { Readable } from "svelte/motion";
import { derived, get, writable, type Writable } from "svelte/store";

export function chunksStore(elements: Writable<Writable<IPositionable<any>>[]>, chunkOffset: Readable <{x: number, y: number}>) {
  const BOARD = getContext<IBoard<any, any>>("board");
  const SETTINGS = getContext<Writable<IBoardSettings>>("settings");
  const POSITIONABLE_KEY = get(SETTINGS).POSITIONABLE_KEY;
  const STATE = BOARD.state;
  const viewOffset = get(STATE).viewOffset;
  const viewPort = get(STATE).viewPort;
  const zoom = get(STATE).zoom;
  const dispatch = createEventDispatcher();

  const positionables = elements; //writable<Writable<IPositionable<any>>[]>([]);

  const hoisted = writable<Writable<IPositionable<any>>[]>([]);
  const chunks = writable(new Map<string, Writable<Writable<IPositionable<any>>[]>>());

  const visibleChunks = derived(
    [chunks, chunkOffset, viewPort, zoom],
    ([_chunks, _chunkOffset, _viewPort, _zoom]) => {
      const CHUNK_WIDTH = get(SETTINGS).CHUNK_WIDTH;
      const CHUNK_HEIGHT = get(SETTINGS).CHUNK_HEIGHT;

      return fastFilter(
        ([id, _]) => {
          const chunkX = parseInt(id.split(":")[0]);
          const chunkY = parseInt(id.split(":")[1]);
          return isInsideViewport(
            chunkX * CHUNK_WIDTH,
            chunkY * CHUNK_HEIGHT,
            CHUNK_WIDTH,
            CHUNK_HEIGHT,
            //$chunkOffset.x * CHUNK_WIDTH,
            //$chunkOffset.y * CHUNK_HEIGHT,
            _chunkOffset.x * CHUNK_WIDTH,
            _chunkOffset.y * CHUNK_HEIGHT,
            _viewPort,
            _zoom,
            CHUNK_WIDTH,
            CHUNK_HEIGHT
          );
        },
        [..._chunks.entries()]
      );
    },
    []
  );

  let oldVisiblePositionableIDs: string[] = [];
  const visiblePositionables = derived([positionables, hoisted, visibleChunks, viewOffset, viewPort, zoom], ([_positionables, _hoisted, _visibleChunks, _viewOffset, _viewPort, _zoom]) => {
    const visible = [
      ..._hoisted,
      ...fastFilter(
        (positionable) => {
          const p = get(positionable);
          return isInsideViewport(
            p.x,
            p.y,
            p.width,
            p.height,
            _viewOffset.x,
            _viewOffset.y,
            _viewPort,
            _zoom,
            0,
            0
          );
        },
        [..._visibleChunks.flatMap((e) => get(e[1]))]
      )
    ];

    const visibleIds = visible.map((e) => get(e)[POSITIONABLE_KEY]);
    //Leave events.
      for (let i = 0; i < oldVisiblePositionableIDs.length; i++) {
        const id = oldVisiblePositionableIDs[i];
        if (!visibleIds.includes(id)) {
          dispatch("positionableLeave", id);
        }
      }

      // Enter events.
      for (let i = 0; i < visibleIds.length; i++) {
        const id = visibleIds[i];
        if (!oldVisiblePositionableIDs.includes(id)) {
          dispatch("positionableEnter", id);
        }
      }
      oldVisiblePositionableIDs = visibleIds;

      return visible;
  });

  // UTILS
  function findChunkContaining(positionable: Writable<IPositionable<any>>): [string, Writable<Writable<IPositionable<any>>[]>] | null {
    for (const chunk of get(chunks).entries()) {
      const [chunkId, chunkContents] = chunk;
      if (get(chunkContents).includes(positionable)) {
        return chunk;
      }
    }
    return null;
  }

  /**
   * Removes all positionables that are no longer in the positionables store.
   */
  function updateExisting() {
    const CHUNK_WIDTH = get(SETTINGS).CHUNK_WIDTH;
    const CHUNK_HEIGHT = get(SETTINGS).CHUNK_HEIGHT;

    hoisted.update(_hoisted => {
      _hoisted.forEach((_positionable, i) => {
        const p = get(_positionable);
        if (!get(positionables).includes(_positionable) || p.hoisted !== true) {
          _hoisted.splice(i, 1);
        }
      })
      return _hoisted;
    });

    for (const chunk of get(chunks).entries()) {
      const [chunkId, chunkContents] = chunk;
      let empty = false;
      chunkContents.update(_contents => {
        _contents.forEach((_positionable, i) => {
          const p = get(_positionable);
          const pChunkId = `${Math.floor(p.x / CHUNK_WIDTH)}:${Math.floor(p.y / CHUNK_HEIGHT)}`;
          if (!get(positionables).includes(_positionable) || pChunkId !== chunkId || p.hoisted === true) {
            _contents.splice(i, 1);
            if (_contents.length <= 0) empty = true;
          }
        });
        // TODO: test, check all positions matching chunk it is inside?
        return _contents;
      })
      if (empty) {
        chunks.update(_chunks => {
          _chunks.delete(chunkId);
          return _chunks;
        })
      }
    }
  }

  /**
   * Updates the chunk / hoisted map from the current positionables array.
   */
  function updateFromPositionables() {
    const CHUNK_WIDTH = get(SETTINGS).CHUNK_WIDTH;
    const CHUNK_HEIGHT = get(SETTINGS).CHUNK_HEIGHT;
    chunks.update(_chunks => {
      const _positionables = get(positionables);
      for (let i = 0; i < _positionables.length; i++) {
        const p = _positionables[i];
        const _p = get(p);
        const pChunkId = `${Math.floor(_p.x / CHUNK_WIDTH)}:${Math.floor(_p.y / CHUNK_HEIGHT)}`;

        // TODO: Hoised
        if (_p.hoisted === true) {
          hoisted.update(_hoisted => {
            if (!_hoisted.includes(p)) {
              _hoisted.push(p);
            }
            return _hoisted;
          })
        }
        else {
          if (!_chunks.has(pChunkId)) {
            _chunks.set(pChunkId, writable<Writable<IPositionable<any>>[]>([p]));
          }
          else {
            _chunks.get(pChunkId)!.update(_chunk => {
              if (!_chunk.includes(p)) {
                _chunk.push(p);
              }
              return _chunk;
            });
          }
        }
      }

      return _chunks;
    });
  }

  function updatePositionable(positionable: Writable<IPositionable<any>>) {
    const chunk = findChunkContaining(positionable);
    if (chunk === null) return; // todo: hoisted
    const [chunkId, chunkContents] = chunk;
    console.warn(chunkId)

    let empty = false;
    chunkContents.update(_contents => {
      _contents.splice(_contents.indexOf(positionable), 1);
      if (_contents.length <= 0) empty = true;
      return _contents;
    })
    if (empty) {
      chunks.update(_chunks => {
        _chunks.delete(chunkId);
        return _chunks;
      })
    }

    const CHUNK_WIDTH = get(SETTINGS).CHUNK_WIDTH;
    const CHUNK_HEIGHT = get(SETTINGS).CHUNK_HEIGHT;
    chunks.update((_chunks) => {
      const p = positionable;
      const _p = get(p);
      const pChunkId = `${Math.floor(_p.x / CHUNK_WIDTH)}:${Math.floor(_p.y / CHUNK_HEIGHT)}`;

      // TODO: Hoised
      if (_p.hoisted === true) {
        updateExisting();
        hoisted.update((_hoisted) => {
          if (!_hoisted.includes(p)) {
            _hoisted.push(p);
          }
          return _hoisted;
        });
      } else {
        if (!_chunks.has(pChunkId)) {
          _chunks.set(pChunkId, writable<Writable<IPositionable<any>>[]>([p]));
        } else {
          _chunks.get(pChunkId)!.update((_chunk) => {
            if (!_chunk.includes(p)) {
              _chunk.push(p);
            }
            return _chunk;
          });
        }
      }

      return _chunks;
    });

    //updateExisting();
    //updateFromPositionables();
  }

  function reload() {
    updateExisting();
    updateFromPositionables();
  }

  function hoist(positionable: Writable<IPositionable<any>>) {
    const chunk = findChunkContaining(positionable);
    if (chunk === null) return;
    const [chunkId, chunkContents] = chunk;
    let empty = false;
    chunkContents.update(_contents => {
      _contents.splice(_contents.indexOf(positionable), 1);
      if (_contents.length <= 0) empty = true;
      return _contents;
    })
    if (empty) {
      chunks.update(_chunks => {
        _chunks.delete(chunkId);
        return _chunks;
      })
    }
    hoisted.update(_hoisted => {
      if (!_hoisted.includes(positionable)) {
        _hoisted.push(positionable);
      }
      return _hoisted;
    });
    positionable.update(v => {
      // @ts-ignore we want this!
      v.hoisted = true;
      return v;
    });
    updatePositionable(positionable);
  }
  function unHoist(positionable: Writable<IPositionable<any>>) {
    hoisted.update(_hoisted => {
      _hoisted.splice(_hoisted.indexOf(positionable), 1);
      return _hoisted;
    })
    positionable.update((v) => {
      // @ts-ignore we want this!
      v.hoisted = false;
      return v;
    });
    updateFromPositionables();
  }

  updateFromPositionables();
  //updateExisting();

  onDestroy(positionables.subscribe((_positionables) => {
    reload();
  }))


  return {
    positionables,
    hoisted,
    chunks,
    visibleChunks,
    visiblePositionables,
    reload,
    updatePositionable,
    hoist,
    unHoist
    // set
    // add
    // remove
    // addPositionable
    // removePositionable

    // subscribe,
    // set,
    // update,
    // add: (positionable: IPositionable<any>) => update((positionables) => [...positionables, positionable]),
    // remove: (positionable: IPositionable<any>) => update((positionables) => positionables.filter((p) => p !== positionable)),
  }
}